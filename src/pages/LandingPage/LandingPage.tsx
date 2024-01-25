import { ArrowRightAltRounded } from "@mui/icons-material"
import { Box, Button, Typography } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { StaggeredList } from "src/components/StaggeredList"
import { SerifFont } from "src/theme"

export default function LandingPage({ show }: { show: boolean }) {
  return (
    <>
      <StaggeredList
        show={show}
        paddingX={1}
        direction={{ md: "row", xs: "column" }}
        justifyContent={{ md: "center", xs: "flex-start" }}
        alignItems={{ md: "center", xs: "unset" }}
        gap={{ md: 2 }}
      >
        <Box
          sx={{
            height: { md: 640, xs: "55vh" },
            // maxWidth: 720,
            objectFit: "cover",
            objectPosition: "center top",
            width: "100%",
          }}
          component="img"
          src="/landing/mobile-demo.png"
        />
        <StaggeredList show={show} gap={1} sx={{ maxWidth: { md: 240 } }}>
          <Typography variant="h6" fontFamily={SerifFont} lineHeight={1.25} gutterBottom>
            Empower your crypto portfolio with{" "}
            <Box
              component="u"
              sx={{
                color: "accent.main",
                textDecorationStyle: "wavy",
                textUnderlinePosition: "under",
              }}
            >
              advanced analytics
            </Box>
            .
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Surface strengths and weaknesses, inspect historical net worth and balances, prepare
            your tax report, and more.
            <br />
            Privatefolio is an open-source, local-first app.
          </Typography>
          <Button
            size="large"
            component={Link}
            to="/u/0"
            variant="contained"
            color="accent"
            sx={{
              "& > span": {
                transition: "transform 0.2s ease-in-out",
              },
              "&:hover > span": {
                transform: "translateX(4px)",
              },
              background:
                "linear-gradient(0deg, var(--mui-palette-accent-dark) 0%, var(--mui-palette-accent-main) 100%)",
              marginTop: 2,
            }}
            endIcon={<ArrowRightAltRounded />}
          >
            Launch app
          </Button>
        </StaggeredList>
      </StaggeredList>
    </>
  )
}
