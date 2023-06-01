"use client";

import { Box, Container } from "@mui/material";
import React from "react";

import ThemeRegistry from "../Theme/ThemeRegistry";
import { Header } from "./Header";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <Container maxWidth="lg">
        <Box
          sx={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
            marginY: 3,
          }}
        >
          <Header />
          {children}
        </Box>
      </Container>
    </ThemeRegistry>
  );
}
