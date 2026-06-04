

"use client";

import React, { useState } from "react";
import { Heart, ShieldCheck, Leaf, Coins, CheckCircle2, ArrowRight, Sparkles, Globe, FileDown } from "lucide-react"; 
import toast from "react-hot-toast";
import { paymentService } from "../../services/api"; 
import Link from "next/link";


declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function DonationPage() {
  const [amount, setAmount] = useState<string>("500");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>(""); 
  const [pdfData, setPdfData] = useState<string | null>(null); 

  const presetAmounts = ["100", "500", "1000", "2500"];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) { // 👈 Simplified (window as any)
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const downloadReceipt = () => {
    if (!pdfData) {
      toast.error("Receipt file data not found.");
      return;
    }

    try {
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: "application/pdf" });

      const fileURL = URL.createObjectURL(fileBlob);
      const dummyLink = document.createElement("a");
      dummyLink.href = fileURL;
      dummyLink.download = `GreenPulse_Receipt_${transactionId || "Donation"}.pdf`;
      document.body.appendChild(dummyLink);
      dummyLink.click();
      document.body.removeChild(dummyLink);
    } catch (err) {
      console.error("Failed to generate download:", err);
      toast.error("Error creating your receipt PDF download.");
    }
  };

  const handlePayment = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : parseFloat(amount);

    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please enter a valid donation amount.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Initializing secure payment session...");

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error("Razorpay SDK failed to load. Are you online?", { id: toastId });
      setLoading(false);
      return;
    }

    try {
      const orderData = await paymentService.createDonationOrder(finalAmount);

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to initiate order");
      }

      const { id: order_id, currency, amount: backendAmount } = orderData.order;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE", 
        amount: backendAmount,
        currency: currency,
        name: "Green Pulse",
        description: "Empowering environmental sustainability initiatives.",
        image: "https://your-domain.com/logo.png", 
        order_id: order_id,
        handler: async function (response: any) {
          try {
            toast.loading("Verifying transaction secure signatures...", { id: toastId });

            const verifyData = await paymentService.verifyDonation({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: finalAmount,
            });

            if (verifyData.success) {
              setTransactionId(response.razorpay_payment_id);
              if ((verifyData as any).pdfFile) {
                setPdfData((verifyData as any).pdfFile);
              }
              setPaymentSuccess(true);
              toast.success("Thank you for your green contribution!", { id: toastId, duration: 5000 });
            } else {
              toast.error("Payment verification failed.", { id: toastId });
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Verification server unreachable.", { id: toastId });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.dismiss(toastId);
          }
        },
        prefill: {
          name: "", 
          email: "",
        },
        theme: {
          color: "#059669", 
        },
      };

      const rzp = new window.Razorpay(options); // 👈 Clean instantiation without compiler errors!
      rzp.open();
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      toast.error(error.message || "Something went wrong.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#090d11] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 antialiased font-sans relative overflow-hidden">
      
      {/* Background Meshing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container Dashboard UI */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#11161d] rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden grid md:grid-cols-12 relative z-10">
        
        {/* LEFT PANEL: Context Sidebar */}
        <div className="md:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-[#151c25] dark:to-[#11161d] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800/80">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 fill-emerald-500/20" /> Green Pulse Fund
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Eco Contribution</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                Directly back micro-NGOs, native forestations, and verified clean tech deployments globally.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-[#19212b] rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 shadow-sm">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Transparent Ledgers</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Every transaction maps directly onto environmental milestones.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-[#19212b] rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900 dark:text-white">Instant Verification</p>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">Automated Razorpay confirmation secures your eco-credits instantly.</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
            Green Pulse Platform Verification ID v2.6
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs & Success Modals */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center min-h-[420px]">
          {paymentSuccess ? (
            /* SUCCESS THANK YOU MSG VIEW */
            <div className="text-center space-y-5 max-w-sm mx-auto py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 stroke-[2]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Transaction Settled
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Thank you for your donation. Your financial backing has been securely allocated into active eco-restoration pipelines.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-[#151c25] border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-4 text-left text-xs space-y-2 font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Transaction ID</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1c2632] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{transactionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Transferred Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    ₹{customAmount ? customAmount : amount} INR
                  </span>
                </div>
              </div>

              {pdfData && (
                <button
                  onClick={downloadReceipt}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition duration-150 text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FileDown className="w-4 h-4" /> Download PDF Receipt
                </button>
              )}

              <Link href="/" className="w-full block">
                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setCustomAmount("");
                    setAmount("500");
                    setPdfData(null); 
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold py-3 px-4 rounded-xl transition duration-150 text-xs shadow-sm flex items-center justify-center gap-1.5"
                >
                  Return to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          ) : (
            /* STANDARD INTERACTIVE PAYLOAD SETUP */
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Select Allocation Amount
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(val);
                        setCustomAmount("");
                      }}
                      className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                        amount === val && !customAmount
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "bg-slate-50 dark:bg-[#151c25] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Custom Contribution (INR)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    placeholder="Enter manual amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmount("");
                    }}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-[#151c25] focus:bg-white dark:focus:bg-[#11161d] border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none rounded-xl text-xs font-semibold transition text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="bg-emerald-500/[0.03] rounded-xl p-4 flex gap-3 border border-emerald-500/10">
                <Coins className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  You are checking out an environmental grant worth{" "}
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{customAmount ? customAmount || 0 : amount} INR
                  </span>. Funds are routed instantly through optimized global climate accounts.
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/10 active:scale-[0.995] disabled:opacity-50 disabled:pointer-events-none transition-all text-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    Authorize Donation • ₹{customAmount ? customAmount || 0 : amount}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Secured via Razorpay Network Gateway
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}