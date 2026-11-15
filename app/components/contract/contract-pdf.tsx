import {
  blockRows,
  headingInk,
  words,
  type Agreement,
  type BlockId,
} from "@/lib/contract/agreement";
import {
  Document,
  Font,
  Image,
  Page,
  Path,
  Svg,
  Rect,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const font = "Louma Sans";
const styles = StyleSheet.create({
  page: {
    padding: 37,
    paddingBottom: 48,
    color: "#152821",
    fontFamily: font,
    fontSize: 9,
    lineHeight: 1.35,
  },
  title: { fontSize: 19, marginTop: 13, marginBottom: 12 },
  logo: { width: 75, height: 33, objectFit: "contain" },
  header: { borderBottomWidth: 2, marginBottom: 10 },
  section: { borderWidth: 1, borderColor: "#dae4de", marginBottom: 7 },
  heading: { fontSize: 10, padding: 4, paddingHorizontal: 8, color: "#fff" },
  rows: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 4,
    paddingHorizontal: 8,
  },
  row: { width: "50%", paddingBottom: 4, paddingHorizontal: 3 },
  label: { color: "#4c5e55", fontSize: 8 },
  signatures: { flexDirection: "row", gap: 9, marginTop: 8 },
  signature: {
    width: "50%",
    height: 59,
    padding: 8,
    borderWidth: 1,
    borderColor: "#dae4de",
  },
  terms: { fontSize: 10, lineHeight: 1.6 },
  footer: {
    position: "absolute",
    bottom: 23,
    left: 37,
    right: 37,
    color: "#4c5e55",
  },
});

let registered = false;
export async function buildContractPdf(a: Agreement) {
  if (!registered) {
    Font.register({
      family: font,
      src: new URL("/fonts/DejaVuSans.ttf", window.location.origin).href,
    });
    Font.registerHyphenationCallback((word) => [word]);
    registered = true;
  }
  const rtl = a.locale === "ar";
  const t = words(a.locale);
  const alignment = {
    textAlign: rtl ? ("right" as const) : ("left" as const),
    direction: rtl ? ("rtl" as const) : ("ltr" as const),
  };
  const footer = (side: string) => (
    <Text fixed style={[styles.footer, alignment]}>
      LOUMA / {side}
    </Text>
  );
  const block = (id: BlockId) => (
    <View key={id} style={styles.section} wrap={false}>
      <Text
        style={[
          styles.heading,
          alignment,
          { backgroundColor: a.color, color: headingInk(a.color) },
        ]}
      >
        {a.headings[id]}
      </Text>
      <View
        style={[styles.rows, { flexDirection: rtl ? "row-reverse" : "row" }]}
      >
        {blockRows(a, id).map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={[styles.label, alignment]}>{label}</Text>
            <Text style={alignment}>{value || "……………………"}</Text>
          </View>
        ))}
      </View>
    </View>
  );
  return pdf(
    <Document title={a.title} creator="Louma" language={a.locale}>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomColor: a.color }]}>
          <View style={{ alignSelf: rtl ? "flex-end" : "flex-start" }}>
            {a.logo ? (
              // React-PDF Image does not support the HTML alt property.
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={a.logo} style={styles.logo} />
            ) : (
              <Svg width={31} height={31} viewBox="0 0 48 48">
                <Rect width={48} height={48} rx={14} fill="#caff74" />
                <Path
                  d="M13 11h8v19h14l-5 7H13z M27 16l5-5h5v5l-5 5h-5z"
                  fill="#152821"
                />
              </Svg>
            )}
          </View>
          <Text style={[styles.title, alignment]}>{a.title}</Text>
        </View>
        {block("agency")}
        {a.order.map(block)}
        <View wrap={false}>
          <Text style={alignment}>
            {t("Fait à / le", "حرر في / بتاريخ")} : {a.place || "……………………"}
          </Text>
          <View
            style={[
              styles.signatures,
              { flexDirection: rtl ? "row-reverse" : "row" },
            ]}
          >
            <Text style={[styles.signature, alignment]}>
              {t("Cachet et signature de l’agence", "ختم وتوقيع الوكالة")}
            </Text>
            <Text style={[styles.signature, alignment]}>
              {t("Signature du locataire", "توقيع المستأجر")}
            </Text>
          </View>
        </View>
        {footer(t("RECTO", "الوجه الأول"))}
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { borderBottomColor: a.color }]}>
          <Text style={[styles.title, alignment]}>{a.headings.terms}</Text>
        </View>
        <Text style={[styles.terms, alignment]}>{a.terms || "……………………"}</Text>
        {footer(t("VERSO", "الوجه الثاني"))}
      </Page>
    </Document>,
  ).toBlob();
}
