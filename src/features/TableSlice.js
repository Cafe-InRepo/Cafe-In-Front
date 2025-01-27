import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tableNumber: localStorage.getItem("tableNumber") || "0",
  placeName: localStorage.getItem("placeName") || "Order Craft",
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableInfo(state, action) {
      const { tableNumber, placeName } = action.payload;
      state.tableNumber = tableNumber;
      state.placeName = placeName;

      // Save to localStorage for persistence
      localStorage.setItem("tableNumber", tableNumber);
      localStorage.setItem("placeName", placeName);
    },
    clearTableInfo(state) {
      state.tableNumber = null;
      state.placeName = null;

      // Clear from localStorage
      localStorage.removeItem("tableNumber");
      localStorage.removeItem("placeName");
    },
  },
});

export const { setTableInfo, clearTableInfo } = tableSlice.actions;

export default tableSlice.reducer;
