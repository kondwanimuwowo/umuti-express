import type { LegalContent } from "./types";

export const medicalDisclaimer: LegalContent = {
  slug: "medical-disclaimer",
  type: "MEDICAL",
  title: "Medical Disclaimer",
  version: "1.0",
  effectiveDate: "20 October 2026",
  summary: "What the information on Umuti Express is, and is not, and what to do in an emergency.",
  sections: [
    {
      heading: "Information for reference only",
      blocks: [
        "The product names, descriptions, strengths and other details shown on Umuti Express come from our shared catalogue and from the pharmacies that list the products. They are there to help you identify and order a medicine. They are not complete, may differ from the pack you receive, and are not medical advice.",
      ],
    },
    {
      heading: "Not a substitute for professional advice",
      blocks: [
        "Nothing on this service diagnoses a condition or recommends a treatment for you. It does not replace a consultation with a doctor, pharmacist or other qualified health professional who knows your history. Do not delay or ignore professional advice because of something you have seen here.",
      ],
    },
    {
      heading: "Emergencies",
      blocks: [
        "Umuti Express is not an emergency service. If you or someone else may be seriously unwell, or if you suspect an overdose, an allergic reaction or poisoning, go to the nearest health facility or call the emergency services immediately. Do not wait for a reply to a chat message.",
      ],
    },
    {
      heading: "Prescription medicines",
      blocks: [
        "Prescription medicines can be supplied only against a valid prescription, and only after a pharmacist has reviewed it. A pharmacist may decline to supply a medicine, or ask you to see your prescriber, if they have a professional or legal concern. Never use a prescription medicine that was prescribed for someone else.",
      ],
    },
    {
      heading: "Using medicines safely",
      blocks: [
        {
          list: [
            "Read the label and the patient information leaflet, and follow the directions given by your prescriber or pharmacist.",
            "Tell the pharmacist about your medical conditions, allergies, other medicines, and whether you are pregnant or breastfeeding, before you take a new medicine.",
            "Check the name, strength and expiry date when you receive an order, and keep medicines as the pack directs and out of the reach of children.",
            "Ask the pharmacy before you stop, change or combine medicines.",
          ],
        },
      ],
    },
    {
      heading: "Side effects and problems with a medicine",
      blocks: [
        "If you think a medicine has caused a reaction, or the medicine you received is damaged, defective or not what you ordered, stop using it if it is safe to do so, speak to a pharmacist or doctor, and tell the pharmacy that supplied it. You can also report suspected adverse reactions and quality problems to the national medicines regulator.",
      ],
    },
    {
      heading: "Messages with a pharmacy",
      blocks: [
        "Replies to your chat messages are written by the pharmacy team on the basis of what you tell them. They are general pharmaceutical information and are not a diagnosis. Give accurate and complete information, and do not use the chat for emergencies.",
      ],
    },
    {
      heading: "Independent pharmacies",
      blocks: [
        "Each pharmacy on Umuti Express is independent. It is responsible for the medicines it supplies, for how they are stored and dispensed, and for the advice its pharmacists give. Umuti Express provides the platform and does not give medical or pharmaceutical advice.",
      ],
    },
  ],
};
