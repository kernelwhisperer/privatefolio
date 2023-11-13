import { Stack } from "@mui/material";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { a, useTransition } from "@react-spring/web";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import HomePage from "./pages/HomePage/HomePage";

export default function App() {
  const location = useLocation();

  const transitions = useTransition(location, {
    config: { friction: 160, mass: 5, tension: 2000 },
    enter: { opacity: 1 },
    exitBeforeEnter: true,
    from: { opacity: 0.9 },
    keys: (location) => location.pathname,
    leave: { opacity: 0.9 },
  });

  return (
    <>
      <Container maxWidth="lg" sx={{ paddingTop: 4 }}>
        <Typography variant="h2" fontFamily="'Roboto Serif', serif">
          <Stack direction="row" gap={1} flexWrap={"wrap"}>
            <span>TradeJournal</span>
          </Stack>
        </Typography>
        {transitions((styles, item) => (
          <a.div
            style={
              {
                ...styles,
                maxWidth: 1200 - 48,
                paddingBottom: 16,
                position: "absolute",
                width: "calc(100% - 48px)",
              } as any
            }
          >
            <Routes location={item}>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </a.div>
        ))}
      </Container>
    </>
  );
}
