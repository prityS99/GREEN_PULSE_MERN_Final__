"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { clearNotification } from "../Slices/uiSlice"; 

export function useFlashMessages() {
  const dispatch = useDispatch();

  const { successMessage, errorMessage } = useSelector((state: any) => state.ui || state.auth);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearNotification());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(clearNotification());
    }
  }, [successMessage, errorMessage, dispatch]);
}