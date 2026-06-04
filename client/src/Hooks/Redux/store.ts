// 1. FIX: Import configureStore from Redux Toolkit, not your local hooks
import { configureStore } from "@reduxjs/toolkit";

// 2. Import your individual slice reducers (watch your casing on folder names like 'slices' vs 'Slices')
import authReducer from "./Slices/authSlice";
// import userReducer from "./slices/userSlice"; // Double check if this folder is 'slices' or 'Slices'
import adminReducer from "./Slices/adminSlice";
// import announcementReducer from "./slices/announcementSlice";
import ngoReducer from "./Slices/ngoSlice";
import cleaningCompanyReducer from "./Slices/cleaningCompanySlice";
import cleaningRequestsReducer from "./Slices/cleaningRequestsSlice";
// import campaignReducer from "./slices/campaignSlice";
// import govtOfficerReducer from "./slices/govtOfficerSlice";
import reviewReducer from "./Slices/reviewSlice";
// import certificateReducer from "./slices/certificateSlice";
// import rewardReducer from "./slices/rewardSlice";
// import badgeReducer from "./slices/badgeSlice";
// import analyticsReducer from "./slices/analyticsSlice";
import paymentReducer from "./Slices/paymentSlice";
import aiChatboxReducer from "./Slices/aiChatBoxSlice";
import notificationReducer from "./Slices/notificationSlice";
// import socketioReducer from "./slices/socketioSlice";
import uiReducer from "./Slices/uiSlice";

// 3. Configure the store database wrapper
export const store = configureStore({
  reducer: {
    auth: authReducer,
    // user: userReducer,
    admin: adminReducer,
    // announcement: announcementReducer,
    ngo: ngoReducer,
    cleaningCompany: cleaningCompanyReducer,
    cleaningRequests: cleaningRequestsReducer,
    // campaign: campaignReducer,
    // govtOfficer: govtOfficerReducer,
    review: reviewReducer,
    // certificate: certificateReducer,
    // reward: rewardReducer,
    // badge: badgeReducer,
    // analytics: analyticsReducer,
    payment: paymentReducer,
    aiChatbox: aiChatboxReducer,
    notification: notificationReducer,
    // socketio: socketioReducer,
    ui: uiReducer,
  },
});

// 4. Export the data types needed by your utils/redux.ts file
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;