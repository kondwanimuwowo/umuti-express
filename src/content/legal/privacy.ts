import type { LegalContent } from "./types";

export const privacy: LegalContent = {
  slug: "privacy",
  type: "PRIVACY",
  title: "Privacy Policy",
  version: "1.0",
  effectiveDate: "20 October 2026",
  summary: "What personal and health information we collect, why, who sees it and the rights you have over it.",
  sections: [
    {
      heading: "Who we are",
      blocks: [
        "{{company}} (\"we\", \"us\", \"our\") operates an online marketplace in Zambia through which customers order medicines from independent pharmacies. We are responsible for the personal information described in this policy, which we handle in line with the Data Protection Act of Zambia.",
        "Health information needs particular care. We collect it only where it is needed to fulfil your order or to give you the service you asked for, and we limit who can see it.",
      ],
    },
    {
      heading: "What we collect",
      blocks: [
        {
          list: [
            "Account details: your name, email address, mobile number, password (stored in protected form) and, if you save one, your address.",
            "Order details: the medicines you order, the pharmacy you order from, whether you collect or have the order delivered, your delivery address, the mobile money number and network you pay with, and the payment reference and status. We do not receive or store your mobile money PIN or card details.",
            "Prescriptions: the photograph or PDF you upload, the medicine it relates to, and the pharmacist's decision and note. A prescription is health information.",
            "Messages: what you write to a pharmacy through the chat, and the replies.",
            "Pharmacy and pharmacist records: for people who work with pharmacies on the platform, their role, registration number, licence and practising certificate.",
            "Records we create: when you accepted our terms, and a log of who opened which prescription or document and when.",
            "Technical data: your IP address and basic device and browser information, collected by our servers and hosting providers when you use the service. We use cookies only to keep you signed in.",
          ],
        },
      ],
    },
    {
      heading: "Why we use it, and our basis for doing so",
      blocks: [
        {
          list: [
            "To create and secure your account, and to contact you about your orders. We do this to perform our contract with you.",
            "To take your order to the pharmacy, process payment, arrange delivery or collection, handle refunds and give you support. We do this to perform our contract with you.",
            "To have a pharmacist review your prescription. We do this with your consent, which you give when you upload it and agree at checkout to share your details with the pharmacy, and because it is needed for the safe supply of a medicine.",
            "To check that pharmacies and pharmacists are properly licensed, and to keep records of who has accessed sensitive information. We do this to meet our legal duties and for the legitimate interest of keeping the platform safe.",
            "To prevent fraud and misuse, and to keep the service working and secure. We do this for our legitimate interests and our legal duties.",
            "To meet legal, tax and regulatory requirements.",
          ],
        },
        "We do not sell your personal information, and we do not use your health information for advertising.",
      ],
    },
    {
      heading: "Who sees your information",
      blocks: [
        "The pharmacy that holds your order. To fulfil an order we share your name, phone number and, for delivery, your address with that pharmacy. If the order includes a prescription item, the pharmacy also receives your prescription. Only that pharmacy can open the prescription you uploaded for that order, and only a pharmacist whose licence and practising certificate we have verified can review it. Another pharmacy cannot see it.",
        "Delivery. Where the pharmacy delivers, the rider is given a slip showing only the order code, your first name, your phone number and your address. It does not name the medicines.",
        "Our service providers, who process information for us under agreements that limit what they may do with it: Lenco by BroadPay, to process mobile money payments; Supabase, which hosts our database, sign-in service and private file storage; and our application hosting provider. Map pages request map tiles from OpenStreetMap, which means your IP address is visible to that service when you view a map.",
        "Our own team. Staff who review pharmacy and pharmacist applications can open the documents submitted for that purpose. Access to prescriptions and verification documents is limited and logged.",
        "Authorities and advisers. We may disclose information where the law requires it, to answer a lawful request from a regulator, court or law enforcement agency, or to our professional advisers, always limited to what is needed.",
        "If our business is sold or reorganised, your information may pass to the new owner, who must keep to this policy.",
      ],
    },
    {
      heading: "Where your information is stored",
      blocks: [
        "Our database and file storage are hosted by Supabase in the United Kingdom (London). Our application hosting and payment providers may process information in other countries. Where information leaves Zambia, we rely on the safeguards the law allows, such as contracts that require the recipient to protect it to an equivalent standard.",
      ],
    },
    {
      heading: "How we protect it",
      blocks: [
        "We protect personal information with measures that include:",
        {
          list: [
            "private storage for prescriptions and verification documents, which are never publicly accessible;",
            "opening a prescription only through a link that expires after one minute, issued only to a verified pharmacist at the pharmacy that holds the order;",
            "a record of every time a prescription or verification document is opened, and by whom;",
            "limiting each pharmacy's access to its own orders, and each member of staff to what their role needs; and",
            "encrypted connections between your device and our service.",
          ],
        },
        "No system is completely secure. If a breach affects your information, we will tell you and the Data Protection Commissioner as the law requires.",
      ],
    },
    {
      heading: "How long we keep it",
      blocks: [
        "We keep your information for as long as your account is open and for as long as we need it to deal with your orders, refunds and complaints, to keep the records the law requires us to keep, and to protect ourselves against claims. When we no longer need information, we delete it or remove anything that identifies you. Pharmacies are independent and keep their own dispensing records, as the law requires of them.",
      ],
    },
    {
      heading: "Your rights",
      blocks: [
        "You have the right to:",
        {
          list: [
            "ask what personal information we hold about you and receive a copy;",
            "have inaccurate information corrected;",
            "ask us to delete your information, where we have no legal reason to keep it;",
            "object to, or ask us to restrict, certain uses of your information;",
            "withdraw a consent you gave, for example to the sharing of a prescription, without affecting what happened before; and",
            "complain to the Data Protection Commissioner if you believe we have not handled your information properly.",
          ],
        },
        "To use any of these rights, contact us {{contact}}. We may need to confirm your identity first, and we will reply within the time the law allows. If you withdraw consent to share your information with a pharmacy, we may not be able to fulfil an order that depends on it.",
      ],
    },
    {
      heading: "Children",
      blocks: [
        "The service is for adults. We do not knowingly create accounts for people under 18. If you order medicine for a child, the information you give about the child is treated as your information and kept to the same standard.",
      ],
    },
    {
      heading: "Changes to this policy",
      blocks: [
        "We may update this policy. The current version and its date are always shown at the top of this page, and we will tell you in the service about significant changes.",
      ],
    },
    {
      heading: "Contact",
      blocks: ["For any question about this policy, or to exercise your rights, contact us {{contact}}."],
    },
  ],
};
