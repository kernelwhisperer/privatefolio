import { AppBar, Button, Container, Stack, Toolbar } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { Logo } from "src/components/Header/Logo"

export default function LandingPageHeader() {
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
          // borderLeft: "none",
          // borderRight: "none",
          // borderTop: "none",
        }}
      >
        <Toolbar disableGutters>
          <Container
            disableGutters
            maxWidth="lg"
            sx={{ marginTop: -0.5, paddingX: { xs: 2 }, paddingY: 0, position: "relative" }}
          >
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              sx={{
                height: "100%",
                paddingX: {
                  sm: 2,
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
          </Container>
        </Toolbar>
      </AppBar>
    </>
  )
}
