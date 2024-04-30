import {
  AccountBalanceRounded,
  ArrowRightAltRounded,
  AutoAwesomeRounded,
  CandlestickChartRounded,
  ExtensionRounded,
  GitHub,
  QueryStatsRounded,
  Telegram,
  Twitter,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Divider,
  IconButton,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { useStore } from "@nanostores/react"
import React from "react"
import { Link } from "react-router-dom"
import { StaggeredList } from "src/components/StaggeredList"
import { $activeIndex } from "src/stores/account-store"
import { SPRING_CONFIGS } from "src/utils/utils"

export default function LandingPage() {
  const activeIndex = useStore($activeIndex)

  return (
    <Stack gap={8} marginTop={8} marginBottom={4}>
      <StaggeredList gap={2} alignItems="center" secondary config={SPRING_CONFIGS.slow} delay={200}>
        <Typography
          variant="h2"
          fontWeight={600}
          sx={{
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundImage: "linear-gradient(31deg, rgb(0, 0, 0) 0%, rgb(135, 21, 173) 100%)",
            fontSize: { lg: "3.75rem", md: "3.25rem", xs: "2.5rem" },
            fontVariationSettings: "'GRAD' 150",
            "html[data-mui-color-scheme='dark'] &": {
              backgroundImage:
                "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(160, 104, 252) 100%)",
            },
            textAlign: "center",
          }}
        >
          The Free* and <Box component="br" sx={{ display: { sm: "none" } }} /> Open-source <br />{" "}
          Portfolio Tracker
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          letterSpacing={0.5}
          fontWeight={300}
          sx={{ fontSize: { lg: "1.5rem", md: "1.25rem", xs: "1rem" }, textAlign: "center" }}
        >
          All your crypto assets in one place
        </Typography>
      </StaggeredList>
      <Stack
        paddingX={1}
        direction={{ sm: "row", xs: "column" }}
        justifyContent="center"
        alignItems="center"
        gap={{ sm: 2 }}
      >
        <Box
          sx={{
            marginBottom: { lg: "-128px", xs: "-190px" },
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 80%)",
            width: { lg: 320, xs: 280 },
          }}
          component="img"
          src="/landing/mobile-demo.png"
        />
        <Typography
          color="text.secondary"
          variant="body2"
          component={Paper}
          elevation={1}
          sx={{
            background: { sm: "transparent !important" },
            border: { sm: 0 },
            boxShadow: "none !important",
            display: "flex",
            maxWidth: { sm: 292, xs: 445 },
            minHeight: { sm: 0, xs: 400 },
            padding: { md: 2, sm: 0, xs: 2 },
          }}
        >
          <Stack gap={3} justifyContent="center">
            <Stack direction="row" gap={2} alignItems="center">
              <CandlestickChartRounded fontSize="large" />
              Inspect and compare your historical net worth with no limitations
            </Stack>
            <Stack direction="row" gap={2} alignItems="center">
              <QueryStatsRounded fontSize="large" />
              Surface the strengths and weaknesses of your portfolio
            </Stack>
            <Stack direction="row" gap={2} alignItems="center">
              <AutoAwesomeRounded fontSize="large" />
              Import your data using .csv files or by connecting to wallets and exchanges (read-only
              API keys)
            </Stack>
            <Stack direction="row" gap={2} alignItems="center">
              <AccountBalanceRounded fontSize="large" />
              Prepare your tax report
            </Stack>
            <Stack direction="row" gap={2} alignItems="center">
              <ExtensionRounded fontSize="large" />
              <span>
                Extend the project under the <b>AGPL-3.0</b> license
              </span>
            </Stack>
          </Stack>
        </Typography>
      </Stack>
      <Stack alignItems="center" gap={0.5}>
        <Button
          size="large"
          component={Link}
          to={`/u/${activeIndex}`}
          variant="contained"
          color="primary"
          sx={{
            "& svg": {
              fontSize: "2rem !important",
            },
            "&:hover": {
              transform: "translateY(-1px)",
            },

            background: "linear-gradient(-25deg, rgb(230, 180, 252) 0%, rgb(135, 21, 173) 100%)",
            // linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(160, 104, 252) 100%)
            borderRadius: 10,
            "html[data-mui-color-scheme='dark'] &": {
              background:
                "linear-gradient(-25deg, rgba(210, 160, 252, 1) 0%, rgb(255, 255, 255) 100%)",
            },
            marginTop: 2,
            paddingX: 6,
            paddingY: 1.5,
            transition: "transform 0.1s ease-in-out",
          }}
          endIcon={<ArrowRightAltRounded />}
        >
          <Typography component="span" variant="h5" fontWeight={600}>
            Launch app
          </Typography>
        </Button>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          *Free as in Freedom
        </Typography>
      </Stack>
      <Stack marginTop={16} gap={12}>
        <Paper
          sx={{
            background: "transparent",
            border: 0,
            padding: 4,
          }}
          transparent="off"
        >
          <Stack
            justifyContent="center"
            alignItems="center"
            direction={{
              sm: "row",
              xs: "column",
            }}
            gap={{
              lg: 12,
              sm: 6,
              xs: 0,
            }}
          >
            <Box
              sx={{
                aspectRatio: "1 / 1",
                filter: "drop-shadow(0px 50px 26px rgba(163, 71, 189, .4))",
                width: { lg: 256, sm: 148, xs: 100 },
              }}
            >
              <Box
                component="img"
                sx={{
                  borderRadius: "inherit",
                  display: "block",
                  height: "100%",
                  imageRendering: "auto",
                  objectFit: "cover",
                  objectPosition: "center center",
                  width: "100%",
                }}
                decoding="async"
                loading="lazy"
                sizes="max((min(100vw, 1600px) - 180px) / 6, 50px)"
                srcSet="https://framerusercontent.com/images/TMSU7EEn6tWu1bXQjXJoGO6p1rA.png?scale-down-to=512 512w, https://framerusercontent.com/images/TMSU7EEn6tWu1bXQjXJoGO6p1rA.png?scale-down-to=1024 1024w, https://framerusercontent.com/images/TMSU7EEn6tWu1bXQjXJoGO6p1rA.png 1500w"
                src="https://framerusercontent.com/images/TMSU7EEn6tWu1bXQjXJoGO6p1rA.png"
                alt=""
              />
            </Box>
            <Stack gap={3} alignItems="center">
              <Typography // fontFamily={SerifFont}
                sx={{ fontVariationSettings: "'GRAD' 150" }}
                variant="h4"
                fontWeight={500}
              >
                Get involved
              </Typography>
              <Typography variant="body1" color="text.secondary" marginTop={-1}>
                Find us on Twitter, Telegram, Discord or GitHub.
              </Typography>
              <Stack direction="row">
                <IconButton
                  size="large"
                  target="_blank"
                  href="https://twitter.com/PrivatefolioApp"
                  LinkComponent={MuiLink}
                  color="primary"
                >
                  <Twitter fontSize="large" />
                </IconButton>
                <IconButton
                  size="large"
                  target="_blank"
                  href="https://t.me/privatefolio"
                  LinkComponent={MuiLink}
                  color="primary"
                >
                  <Telegram fontSize="large" />
                </IconButton>
                <IconButton
                  size="large"
                  target="_blank"
                  href="https://discord.gg/Es69upwBqW"
                  LinkComponent={MuiLink}
                  color="primary"
                >
                  <svg
                    width="32px"
                    height="32px"
                    viewBox="0 -28.5 256 256"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid"
                  >
                    <g>
                      <path
                        d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                        fill="currentColor"
                        fillRule="nonzero"
                      ></path>
                    </g>
                  </svg>
                </IconButton>
                <IconButton
                  size="large"
                  target="_blank"
                  href="https://github.com/kernelwhisperer/privatefolio"
                  LinkComponent={MuiLink}
                  color="primary"
                >
                  <GitHub fontSize="large" />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
        <Paper
          sx={{
            background: "radial-gradient(84.6% 67% at 50% 100%,#f7dbff 0%,rgb(255,255,255) 100%)",
            border: 0,
            "html[data-mui-color-scheme='dark'] &": {
              background: "radial-gradient(77.3% 69.3% at 50% 100%, #7b1cba 0%, rgb(0, 0, 0) 100%)",
            },
            padding: 4,
          }}
          transparent="off"
        >
          <Stack
            justifyContent="center"
            alignItems="center"
            direction={{
              sm: "row",
              xs: "column-reverse",
            }}
            gap={{
              lg: 12,
              sm: 6,
              xs: 0,
            }}
          >
            <Stack gap={3} alignItems="center">
              <Typography
                // fontFamily={SerifFont}
                sx={{ fontVariationSettings: "'GRAD' 150" }}
                variant="h4"
                fontWeight={500}
              >
                Join our newsletter
              </Typography>
              <Typography variant="body1" marginTop={-1} color="text.secondary">
                Keep up with the latest updates and news.
              </Typography>
              <Box
                component="iframe"
                src="https://paragraph.xyz/@privatefolio/embed?minimal=true&vertical=true"
                sx={{
                  borderRadius: "5px",
                  // background: "white",
                  // border: "1px solid #EEE",
                  height: 80,
                  marginX: -4,
                  width: 260,
                }}
                frameBorder="0"
                scrolling="no"
              />
              {/* <Button
                target="_blank"
                href="https://kernelwhisperer.substack.com/?utm_source=landing&utm_medium=web&utm_campaign=landing_1"
                LinkComponent={MuiLink}
                variant="contained"
                size="large"
              >
                Subscribe
              </Button> */}
              <Typography variant="body1" color="text.secondary">
                Or read it first at{" "}
                <MuiLink
                  href="https://paragraph.xyz/@privatefolio"
                  target="_blank"
                  underline="hover"
                >
                  paragraph.xyz/@privatefolio
                </MuiLink>
                .
              </Typography>
            </Stack>
            <Box
              sx={{
                aspectRatio: "1 / 1",
                filter: "drop-shadow(0px 50px 26px rgba(163, 71, 189, .4))",
                width: { lg: 276, sm: 148, xs: 100 },
              }}
            >
              <Box
                component="img"
                sx={{
                  borderRadius: "inherit",
                  display: "block",
                  height: "100%",
                  imageRendering: "auto",
                  objectFit: "cover",
                  objectPosition: "center center",
                  transform: "rotateY(180deg)",
                  width: "100%",
                }}
                decoding="async"
                loading="lazy"
                sizes="max((min(100vw, 1600px) - 180px) / 6, 50px)"
                srcSet="https://framerusercontent.com/images/U8BliLSYurKQHRyLYQC9YGr3sHU.png?scale-down-to=512 512w, https://framerusercontent.com/images/U8BliLSYurKQHRyLYQC9YGr3sHU.png?scale-down-to=1024 1024w, https://framerusercontent.com/images/U8BliLSYurKQHRyLYQC9YGr3sHU.png 1500w"
                src="https://framerusercontent.com/images/U8BliLSYurKQHRyLYQC9YGr3sHU.png"
                alt=""
              />
            </Box>
          </Stack>
        </Paper>
      </Stack>
      <Divider />
      <Typography variant="body2">© 2024 Privatefolio. All right reserved.</Typography>
    </Stack>
  )
}
