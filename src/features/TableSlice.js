import { createSlice } from "@reduxjs/toolkit";
import logo from "../images/SmallLogo.png";

const initialState = {
  tableNumber: localStorage.getItem("tableNumber") || "0",
  placeName: localStorage.getItem("placeName") || "Order Craft",
  placeLogo: logo,
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableInfo(state, action) {
      const { tableNumber, placeName, placeLogo } = action.payload;
      state.tableNumber = tableNumber;
      state.placeName = placeName;
      state.placeLogo = placeLogo;

      // Save to localStorage for persistence
      localStorage.setItem("tableNumber", tableNumber);
      localStorage.setItem("placeName", placeName);
      localStorage.setItem("placeLogo", placeLogo);
    },
    clearTableInfo(state) {
      state.tableNumber = null;
      state.placeName = null;
      state.placeLogo = null;

      // Clear from localStorage
      localStorage.removeItem("tableNumber");
      localStorage.removeItem("placeName");
      localStorage.removeItem("placeLogo");
    },
  },
});

export const { setTableInfo, clearTableInfo } = tableSlice.actions;

export default tableSlice.reducer;
