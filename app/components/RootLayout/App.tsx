"use client";

import { Box, Container } from "@mui/material";
import React from "react";

import ThemeRegistry from "../Theme/ThemeRegistry";
import { Header } from "./Header";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <Container maxWidth="lg" sx={{ padding: { sm: 0 } }}>
        <Box
          sx={{
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Header />
          {/* <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
          >
            <Link
              underline="hover"
              color="inherit"
              href="/"
              component={NextLink}
            >
              Home
            </Link>
          </Breadcrumbs> */}
          {/* <LazyMotion features={domAnimation}> */}
          {/* TODO: https://github.com/vercel/next.js/issues/49279 */}
          {/* <AnimatePresence>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -80 }}
     
              transition={{
                damping: 20,
                stiffness: 40,
                type: "spring",
              }}
            >
            </motion.div>
          </AnimatePresence> */}
          {children}
        </Box>
      </Container>
    </ThemeRegistry>
  );
}
