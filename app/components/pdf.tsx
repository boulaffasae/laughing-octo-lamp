import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#263c36",
    lineHeight: 1.5,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#263c36",
    paddingBottom: 14,
    marginBottom: 16,
  },
  kicker: { fontSize: 8, color: "#778477", letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 25, fontFamily: "Helvetica-Bold", lineHeight: 1.2 },
  subtitle: { fontSize: 10, color: "#778477", marginTop: 8 },
  columns: { flexDirection: "row", gap: 20, marginBottom: 16 },
  column: { width: "50%", minWidth: 0 },
  card: {
    padding: 12,
    backgroundColor: "#f3f5f1",
    borderRadius: 8,
    marginBottom: 12,
  },
  heading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 9,
  },
  field: { marginBottom: 7 },
  label: { fontSize: 7, color: "#778477", marginBottom: 2 },
  value: { fontSize: 10 },
  period: {
    borderWidth: 1,
    borderColor: "#dce3da",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dates: { flexDirection: "row", gap: 20 },
  date: { width: "38%" },
  duration: { width: "24%" },
  conditions: { fontSize: 8, color: "#647266", lineHeight: 1.7 },
  signatures: { flexDirection: "row", gap: 20, marginTop: 18 },
  signbox: {
    width: "50%",
    height: 90,
    borderWidth: 1,
    borderColor: "#dce3da",
    borderRadius: 8,
    padding: 13,
  },
  signTitle: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  signHint: { fontSize: 7, color: "#778477", marginTop: 4 },
  foot: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e4e9e2",
    paddingTop: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#879184",
  },
});

export function ContractDocument({
  data,
  rental: r,
}: {
  data: Record<string, string>[];
  rental: Record<string, string>;
}) {
  const date = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("fr-MA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const days = Math.round((Date.parse(r.end) - Date.parse(r.start)) / 86400000);
  const fields = (values: [string, string][]) =>
    values.map(([label, value]) => (
      <View key={label} style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "À compléter"}</Text>
      </View>
    ));
  return (
    <Document title="Contrat de location de véhicule" creator="Louma">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>LOCATION DE VÉHICULE</Text>
          <Text style={styles.title}>Contrat de location</Text>
          <Text style={styles.subtitle}>
            Établi le {new Date().toLocaleDateString("fr-MA")}
          </Text>
        </View>
        <View style={styles.columns}>
          <View style={styles.column}>
            <View style={styles.card}>
              <Text style={styles.heading}>01 / LE LOCATAIRE</Text>
              {fields([
                ["Nom complet", data[0].name],
                ["N° CNIE", data[0].identity],
                ["Adresse", data[0].address],
                ["Permis de conduire", data[1].licence],
                ["Catégorie", data[1].category],
                ["Expiration du permis", data[1].expiry],
              ])}
            </View>
          </View>
          <View style={styles.column}>
            <View style={styles.card}>
              <Text style={styles.heading}>02 / L’AGENCE DE LOCATION</Text>
              {fields([["Loueur", r.agency]])}
            </View>
            <View style={styles.card}>
              <Text style={styles.heading}>03 / LE VÉHICULE</Text>
              {fields([
                ["Marque et modèle", data[2].brand],
                ["Immatriculation", data[2].plate],
                ["N° de châssis", data[2].vin],
              ])}
            </View>
          </View>
        </View>
        <View style={styles.period}>
          <Text style={styles.heading}>04 / PÉRIODE DE LOCATION</Text>
          <View style={styles.dates}>
            <View style={styles.date}>
              {fields([["Départ", date(r.start)]])}
            </View>
            <View style={styles.date}>
              {fields([["Retour prévu", date(r.end)]])}
            </View>
            <View style={styles.duration}>
              {fields([["Durée", `${days} jour${days > 1 ? "s" : ""}`]])}
            </View>
          </View>
        </View>
        <View wrap={false}>
          <Text style={styles.heading}>
            05 / CONDITIONS DE REMISE ET DE RESTITUTION
          </Text>
          <Text style={styles.conditions}>
            Le véhicule est confié au locataire pour la période indiquée. Le
            locataire s’engage à le restituer à la date convenue et à respecter
            les règles de circulation. L’état du véhicule, le kilométrage, le
            carburant, les garanties d’assurance et les conditions financières
            convenues entre les parties sont à préciser dans une annexe signée,
            jointe au présent contrat.
          </Text>
          <View style={styles.signatures}>
            <View style={styles.signbox}>
              <Text style={styles.signTitle}>Le locataire</Text>
              <Text style={styles.signHint}>Lu et approuvé - Signature</Text>
            </View>
            <View style={styles.signbox}>
              <Text style={styles.signTitle}>L’agence de location</Text>
              <Text style={styles.signHint}>
                Signature et cachet de l’agence
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.foot} wrap={false}>
          <Text>
            Document préparé avec Louma · Outil de création de contrats
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

export async function makeContract(
  data: Record<string, string>[],
  rental: Record<string, string>,
) {
  const blob = await pdf(
    <ContractDocument data={data} rental={rental} />,
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contrat_location.pdf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
