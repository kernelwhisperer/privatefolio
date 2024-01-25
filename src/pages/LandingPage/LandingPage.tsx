import { ArrowRightAltRounded } from "@mui/icons-material"
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { Logo } from "src/components/Header/Logo"
import { StaggeredList } from "src/components/StaggeredList"
import { SerifFont } from "src/theme"

export default function LandingPage({ show }: { show: boolean }) {
  return (
    <>
      <meta name="theme-color" content={"rgb(40, 40, 40)"} />
      <AppBar
        position="static"
        elevation={0}
        // variant="outlined"
        color="transparent"
        sx={{
          border: "none",
          marginBottom: 2,
          marginTop: -2,
          // borderLeft: "none",
          // borderRight: "none",
          // borderTop: "none",
        }}
      >
        <Toolbar disableGutters>
          <Stack
            direction="row"
            gap={0}
            alignItems="center"
            justifyContent="space-between"
            sx={{
              height: "100%",
              paddingX: {
                // sm: 1,
                xs: 1,
              },
              width: "100%",
            }}
          >
            <Logo />
            <Button
              component={Link}
              to="/u/0"
              variant="contained"
              color="primary"
              sx={{ minWidth: 107 }}
            >
              Launch app
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
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
            Privatefolio is an open-source, local-first portfolio tracker.
          </Typography>
          <Button
            size="large"
            component={Link}
            to="/u/0"
            variant="contained"
            color="accent"
            sx={{
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
