import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Tab,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { IntegrationAvatar } from "src/components/IntegrationAvatar"
import { Tabs } from "src/components/Tabs"
import { useBoolean } from "src/hooks/useBoolean"
import { PARSERS_META } from "src/settings"

import { BinanceHelp } from "./help/BinanceHelp"
import { EtherscanHelp } from "./help/EtherscanHelp"

export function FileImportHelp() {
  const { value: modalOpen, toggle: toggleModalOpen } = useBoolean(false)

  const [tab, setTab] = useState("etherscan")

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
  }

  return (
    <>
      <Paper
        sx={{
          "&:hover": {
            backgroundColor: "var(--mui-palette-action-hover)",
          },
          backgroundColor: "var(--mui-palette-background-default)",
          borderColor: "var(--mui-palette-TableCell-border)",
          cursor: "pointer",
          padding: 1,
          textAlign: "center",
        }}
        elevation={0}
        variant="outlined"
        onClick={toggleModalOpen}
      >
        <Typography variant="body2" color="text.secondary">
          <u>Learn how to export</u> your data from Binance, Etherscan, MEXC and more.
        </Typography>
      </Paper>
      <Dialog open={modalOpen} onClose={toggleModalOpen}>
        <DialogTitle>
          <span>How to create file imports</span>
        </DialogTitle>
        <DialogContent sx={{ maxWidth: 540, minWidth: 320, paddingX: 2, width: 540 }}>
          <div>
            {/* <SectionTitle>Name *</SectionTitle> */}
            <Tabs value={tab} onChange={handleTabChange}>
              {["etherscan", "binance"].map((parserId) => (
                <Tab
                  sx={{ textTransform: "none" }}
                  key={parserId}
                  value={parserId}
                  label={
                    <Stack direction="row" alignItems={"center"} gap={0.5}>
                      <IntegrationAvatar
                        size="small"
                        src={`/app-images/integrations/${parserId.split("-")[0].toLowerCase()}.svg`}
                        alt={parserId}
                      />
                      {PARSERS_META[parserId]}
                    </Stack>
                  }
                />
              ))}
            </Tabs>
            {tab === "binance" && <BinanceHelp />}
            {tab === "etherscan" && <EtherscanHelp />}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleModalOpen} color="secondary" sx={{ paddingX: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
