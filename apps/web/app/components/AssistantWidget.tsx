"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Fab,
  Slide,
} from "@mui/material";

interface QA {
  keywords: string[];
  answer: string;
}

const KNOWLEDGE_BASE: QA[] = [
  {
    keywords: ["hvor", "beliggenhet", "location", "adresse", "where"],
    answer:
      "Leiligheten ligger i Pigi Paradise, i den lille landsbyen Pigi i Rethymno-regionen på Kreta. Det er 2,5 km til nærmeste strand og 10 km til Rethymno sentrum. Bussholdeplass er like ved.",
  },
  {
    keywords: ["størrelse", "stor", "kvadrat", "kvm", "plass", "size"],
    answer:
      "Leiligheten er ca. 60 kvadratmeter med 6 soveplasser: 1 dobbeltseng, 2 enkeltsenger og en sovesofa.",
  },
  {
    keywords: ["basseng", "pool", "svømme", "bade", "swimming"],
    answer:
      "Komplekset har et stort svømmebasseng på 200 kvm med egen barneseksjon.",
  },
  {
    keywords: ["strand", "beach", "hav", "sjø", "sea"],
    answer:
      "Nærmeste strand ligger bare 2,5 km unna. Rethymno sentrum med flere strender er 10 km.",
  },
  {
    keywords: ["rethymno", "by", "sentrum", "town", "city"],
    answer:
      "Rethymno sentrum er 10 km unna. Det er en sjarmerende venetiansk gammel by med restauranter, butikker og strender. Bussholdeplass er like ved komplekset.",
  },
  {
    keywords: ["landsby", "pigi", "loutra", "village"],
    answer:
      "Pigi er en historisk landsby nevnt i venetianske dokumenter fra 1500-tallet. Den er fødestedet til den greske forfatteren Pantelis Prevelakis. Nabolandsbyen Loutra fikk navnet sitt fra en venetiansk fontene. Begge landsbyene har tradisjonelle tavernaer der du kan nyte kretisk mat.",
  },
  {
    keywords: ["grill", "barbeque", "bbq", "grille"],
    answer:
      "Komplekset har et flott grillområde med overdekket terrasse som alle beboere kan bruke.",
  },
  {
    keywords: ["hage", "garden", "planter", "blomster"],
    answer:
      "Pigi Paradise har en stor fellespark med grønne plener, aromatiske planter og blomster, med automatisk vanningsanlegg.",
  },
  {
    keywords: ["sesong", "når", "season", "best", "tid", "periode"],
    answer:
      "Høysesong er mai–august med best vær og høyest aktivitet. Lavsesong er september–oktober — roligere og rimeligere, men fortsatt fint vær. November–april er leiligheten vanligvis ikke tilgjengelig.",
  },
  {
    keywords: ["vær", "weather", "temperatur", "varmt", "kaldt", "regn", "sol", "klima", "grader"],
    answer:
      "Mai: 23°C dag / 14°C natt, hav 19°C, 9 timer sol. Juni: 28°C, hav 22°C, 12 timer sol. Juli–august: 30°C, hav 25–26°C, nesten null regn — perfekt strandvær! September: 27°C, hav 25°C (varmest!), bare 3 regndager. Oktober: 22°C, hav 23°C, noen regnbyger men fortsatt badevær.",
  },
  {
    keywords: ["hav", "havtemp", "bade", "svømme", "sea", "water", "badetemperatur"],
    answer:
      "Havtemperaturen stiger fra 19°C i mai til 26°C i august (årets varmeste). September holder 25°C — fantastisk for bading! Selv i oktober er havet 23°C. Badesesongen med over 20°C hav varer fra juni til november.",
  },
  {
    keywords: ["uv", "solkrem", "solbrenthet", "sunscreen", "solbeskyttelse"],
    answer:
      "UV-indeksen er 9–11 (svært høy) i sommermånedene juni–august. Bruk solkrem med høy faktor og søk skygge mellom kl. 11–16. Mai, september og oktober har UV 5–8 — fortsatt viktig med solbeskyttelse.",
  },
  {
    keywords: ["vind", "meltemi", "wind", "bølger", "sjøforhold"],
    answer:
      "Den kjente Meltemi-vinden blåser fra nord juni–september (sterkest juli–august). Den gir frisk bris og holder temperaturen behagelig. Nordkysten kan få noe bølger, men strendene nær Pigi er generelt beskyttet. Vindstille dager er vanligst i mai og september.",
  },
  {
    keywords: ["dagslys", "soloppgang", "solnedgang", "sunrise", "sunset", "timer"],
    answer:
      "Om sommeren (juni–august) er det over 14 timer dagslys — soloppgang ca. 06:00, solnedgang ca. 20:30. Vår og høst: ca. 06:30–19:00. Lange, lyse kvelder perfekt for middag på terrassen!",
  },
  {
    keywords: ["pris", "kost", "betale", "price", "cost", "vennepris"],
    answer:
      "Høysesong (mai–august): 1 300 kr per døgn. Lavsesong (september–oktober): 1 000 kr per døgn. Utvask: 1 500 kr. Se Priser-fanen for komplett oversikt.",
  },
  {
    keywords: ["transport", "buss", "fly", "airport", "flyplass", "komme", "reise"],
    answer:
      "Nærmeste flyplass er Chania International Airport (ca. 45 min med bil). Det er bussholdeplass like ved komplekset med forbindelse til Rethymno. Leiebil anbefales for å utforske øya.",
  },
  {
    keywords: ["utflukt", "tur", "excursion", "opplev", "gjøre", "aktivitet", "severdighet"],
    answer:
      "Pigi Paradise er perfekt som base for utflukter på Kreta. Populære turer inkluderer Samaria-juvet, Knossos, Balos-stranden, og de sjarmerende landsbyene i fjellene. Rethymno har en flott venetiansk gamleby.",
  },
  {
    keywords: ["mat", "restaurant", "spise", "taverna", "food", "eat"],
    answer:
      "I landsbyene Pigi og Loutra finner du tradisjonelle tavernaer med ekte kretisk mat. Rethymno (10 km) har et stort utvalg restauranter langs havnepromenaden.",
  },
  {
    keywords: ["sove", "seng", "soveplass", "sleep", "bed", "gjest"],
    answer:
      "Leiligheten har 6 soveplasser: 1 dobbeltseng, 2 enkeltsenger og en sovesofa.",
  },
  {
    keywords: ["vask", "utvask", "rengjøring", "clean"],
    answer:
      "Det er en egen vaskehjelp som vasker ut etter besøket. Utvask koster 1 500 kr.",
  },
  {
    keywords: ["wifi", "internett", "nett", "internet", "tv", "apple"],
    answer:
      "Leiligheten har WiFi og Apple TV.",
  },
  {
    keywords: ["historie", "history", "gammel", "venetian"],
    answer:
      "Pigi er nevnt i venetianske dokumenter fra 1500- og 1600-tallet. Navnet kommer fra en kilde nær elven Pigiano som ble ødelagt i et jordskjelv. Landsbyen er fødestedet til forfatteren Pantelis Prevelakis. Loutra fikk sitt navn fra en venetiansk fontene.",
  },
  {
    keywords: ["booking", "bestill", "reserver", "book"],
    answer:
      "For å bestille leiligheten, ta kontakt med en av eierne. Ledige perioder kan du se i Kalender-fanen.",
  },
  {
    keywords: ["terrasse", "balkong", "ute", "utemøbler"],
    answer:
      "Leiligheten har en stor, godt møblert terrasse — perfekt for måltider ute og avslapping.",
  },
  {
    keywords: ["vaskemaskin", "klesvask", "tøy", "laundry", "washing"],
    answer:
      "Det er en ny vaskemaskin i leiligheten med stor kapasitet.",
  },
  {
    keywords: ["oppvask", "kjøkken", "dishwasher", "kitchen"],
    answer:
      "Kjøkkenet er utstyrt med oppvaskmaskin, og ellers det du trenger for å lage mat.",
  },
];

const GREETING =
  "Hei! Jeg er assistenten for Pigi Paradise på Kreta. Still meg gjerne spørsmål om leiligheten, beliggenhet, fasiliteter eller sesonger.";

const FALLBACK =
  "Beklager, jeg har ikke informasjon om det akkurat nå. Prøv å spørre om leiligheten, beliggenhet, strand, basseng, sesonger, priser, mat eller aktiviteter.";

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  let bestMatch: QA | null = null;
  let bestScore = 0;

  for (const qa of KNOWLEDGE_BASE) {
    const score = qa.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }

  return bestMatch ? bestMatch.answer : FALLBACK;
}

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { role: "user", text };
    const answer = findAnswer(text);
    const botMsg: Message = { role: "assistant", text: answer };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <Fab
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            bgcolor: "#1DB954",
            color: "#fff",
            "&:hover": { bgcolor: "#1aa34a" },
            zIndex: 1200,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
          }}
        >
          <Typography sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>💬</Typography>
        </Fab>
      )}

      {/* Chat panel */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: { xs: 0, sm: 24 },
            right: { xs: 0, sm: 24 },
            width: { xs: "100%", sm: 380 },
            height: { xs: "100vh", sm: 500 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: { xs: 0, sm: 3 },
            zIndex: 1300,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              bgcolor: "rgba(29,185,84,0.1)",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                Pigi Paradise Assistent
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                Spør om leiligheten
              </Typography>
            </Box>
            <IconButton
              onClick={() => setOpen(false)}
              sx={{ color: "rgba(255,255,255,0.6)", p: 0.5 }}
            >
              ✕
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            ref={scrollRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor:
                      msg.role === "user"
                        ? "rgba(29,185,84,0.2)"
                        : "rgba(255,255,255,0.06)",
                    border: "1px solid",
                    borderColor:
                      msg.role === "user"
                        ? "rgba(29,185,84,0.3)"
                        : "rgba(255,255,255,0.08)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#fff",
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Input */}
          <Box
            sx={{
              px: 1.5,
              py: 1.5,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              placeholder="Skriv et spørsmål..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: "0.85rem",
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!input.trim()}
              sx={{
                color: "#1DB954",
                "&.Mui-disabled": { color: "rgba(255,255,255,0.2)" },
              }}
            >
              ➤
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
