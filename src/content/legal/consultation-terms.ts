import type { LegalContent } from "./types";

export const consultationTerms: LegalContent = {
  slug: "consultation-terms",
  type: "CONSULT",
  title: "Consultation Terms",
  version: "1.0",
  effectiveDate: "20 October 2026",
  summary: "The terms for paid consultations with verified pharmacists booked through Umuti Express.",
  sections: [
    {
      heading: "What a consultation is",
      blocks: [
        "A consultation is a paid, private conversation by chat between you and a pharmacist who is independent of Umuti Express and whose licence and practising certificate we have verified. The pharmacist gives pharmaceutical advice, for example about how to take a medicine, interactions, side effects and when to see a doctor.",
        "These terms apply to every consultation you book, together with our Terms of Service, Privacy Policy and Medical Disclaimer. If they conflict, these terms apply to the consultation.",
      ],
    },
    {
      heading: "What a consultation is not",
      blocks: [
        "A consultation is not an emergency service and is not a replacement for seeing a doctor. The pharmacist may advise you to see a doctor or go to a health facility, and may decline to continue if they believe the matter is outside what can safely be dealt with by chat. A consultation does not result in a prescription.",
        "In an emergency, go to the nearest health facility or call the emergency services. Do not wait for a pharmacist to reply.",
      ],
    },
    {
      heading: "The pharmacist",
      blocks: [
        "The pharmacist is an independent professional. They are responsible for the advice they give and are bound by the ethical and professional duties that apply to them, including confidentiality. Umuti Express provides the platform, verifies the pharmacist's documents, collects payment and passes the fee to the pharmacist. We do not give advice and we do not supervise the content of a consultation.",
        "A pharmacist's verification lasts only while their practising certificate is in date. If it lapses, they can no longer take consultations.",
      ],
    },
    {
      heading: "Booking, fee and payment",
      blocks: [
        "Each pharmacist sets the fee for their consultation, which is shown in kwacha before you book. You pay in full when you book, by mobile money, through our payment provider. We hold the fee until the consultation is complete and then release it to the pharmacist.",
        "A consultation is complete when the pharmacist closes it, or when it has been inactive for the period shown when you book. You can raise a concern about a consultation before it is completed.",
      ],
    },
    {
      heading: "Refunds",
      blocks: [
        "You are refunded in full if the pharmacist does not respond within the time shown when you book, if the pharmacist cancels or declines the consultation, or if a technical fault on our platform prevents it from taking place.",
        "Once a pharmacist has given you advice, the fee is not refundable because you disagree with it or because it did not give you the outcome you wanted. If you believe the consultation fell below a reasonable professional standard, contact us {{contact}} and we will look into it and may refund the fee in whole or part.",
      ],
    },
    {
      heading: "Your information",
      blocks: [
        "What you write in a consultation, and any information or images you share, is health information. It is available to the pharmacist you booked and is handled as described in our Privacy Policy. Give accurate and complete information, because the advice depends on it. We keep a record of the conversation so that a concern can be investigated.",
        "Do not record, copy or publish a pharmacist's messages in a way that identifies them without their agreement, except to make a complaint or as the law allows.",
      ],
    },
    {
      heading: "Conduct",
      blocks: [
        "Treat the pharmacist with respect. A pharmacist may end a consultation if you are abusive, ask for something unlawful, or ask for a prescription medicine without a prescription. The fee is not refunded in those cases.",
      ],
    },
    {
      heading: "Liability",
      blocks: [
        "The pharmacist is responsible for the advice they give. Umuti Express is responsible for operating the platform with reasonable care, for verifying the pharmacist's documents as described, and for the payment arrangements. Nothing in these terms excludes liability for death or personal injury caused by negligence, for fraud, or for any liability that cannot be excluded by law. Subject to that, our total liability to you for a consultation is limited to the fee you paid for it.",
      ],
    },
    {
      heading: "Changes and governing law",
      blocks: [
        "We may update these terms for future consultations by publishing a new version. These terms are governed by the laws of the Republic of Zambia, and the courts of Zambia have jurisdiction over any dispute.",
      ],
    },
  ],
};
