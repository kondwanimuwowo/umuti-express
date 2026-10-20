import type { LegalContent } from "./types";

export const terms: LegalContent = {
  slug: "terms",
  type: "TERMS",
  title: "Terms of Service",
  version: "1.0",
  effectiveDate: "20 October 2026",
  summary: "The rules for using Umuti Express to order medicines from partner pharmacies.",
  sections: [
    {
      heading: "About Umuti Express",
      blocks: [
        "{{company}} (\"we\", \"us\", \"our\") operates an online marketplace in Zambia that lets you find medicines listed by independent pharmacies and order them from the pharmacy of your choice.",
        "We are not a pharmacy and we do not sell, store, prepare or dispense medicines. When you place an order, the sale is a contract between you and the pharmacy that fulfils it. We provide the platform, take payment on the pharmacy's behalf and support the order. Each pharmacy is independent of us and is responsible for the medicines it supplies and for the advice its pharmacists give.",
        "By creating an account, or by placing an order, you agree to these Terms of Service and to our Privacy Policy and Medical Disclaimer.",
      ],
    },
    {
      heading: "Using the service",
      blocks: [
        "You must be at least 18 years old to create an account. If you order for a child or for someone you care for, you are responsible for the order and for giving the pharmacy accurate information about the person who will use the medicine.",
        "You agree to give accurate and current information, to keep your sign-in details private, and to tell us promptly if you think someone else has used your account. You are responsible for what happens under your account.",
        "You may hold one account. We may ask you to confirm your identity where this is needed to protect you, a pharmacy or other customers.",
      ],
    },
    {
      heading: "Medicines, listings and prices",
      blocks: [
        "Pharmacies decide which medicines they list and set their own prices in Zambian kwacha. The same medicine can therefore cost different amounts at different pharmacies. The price you see when you add an item to your cart is the price of the medicines. It does not include any delivery charge (see section 6).",
        "Product details come from our shared catalogue and from the pharmacies. They are provided for reference and may not show everything that is on the pack. Always read the label and the patient information leaflet. Photographs are illustrative.",
        "Stock is held by each pharmacy. When you place an order, the quantities are reserved for you while the order is in progress. If a pharmacy later finds it cannot supply an item, it will cancel the order and we will refund any payment you have made.",
      ],
    },
    {
      heading: "Prescription medicines",
      blocks: [
        "Some medicines can be supplied only on a valid prescription. Products that need one are marked \"Prescription needed\".",
        "If your cart includes such a product, you will be asked to upload a clear photograph or PDF of your prescription when you check out. Your order is then sent to the pharmacy without any charge. A pharmacist at that pharmacy, whose licence and practising certificate we have verified, reviews the prescription. If it is approved, you will be asked to pay and the pharmacy prepares your order. If it is not approved, the order is cancelled, you are not charged, and the pharmacist gives you a reason.",
        "You must upload only a genuine prescription that was issued for you, or for a person you are authorised to collect medicine for. You must not submit a prescription that is forged, altered, expired or already used. A pharmacist may refuse to supply a medicine for professional or legal reasons, and we cannot override that decision.",
      ],
    },
    {
      heading: "Placing an order and paying",
      blocks: [
        "When you place an order you make an offer to buy the items from the pharmacy. The sale is concluded when payment has been confirmed and the pharmacy has accepted the order, which for a prescription item also requires the prescription to have been approved.",
        "You pay by mobile money (MTN Mobile Money or Airtel Money). Payments are processed by our payment provider, Lenco by BroadPay. By placing an order you authorise the charge to the mobile number you give us. Your mobile money provider may apply fees of its own, which we do not control.",
        "We keep a record of each order, its status and its payment reference. You can follow an order on the Track order page.",
      ],
    },
    {
      heading: "Collection and delivery",
      blocks: [
        "At checkout you choose between collecting your order from the pharmacy and, where the pharmacy offers it, delivery.",
        "Delivery is arranged directly between you and the pharmacy. Any delivery charge is agreed with the pharmacy and paid to it, or to its rider, on arrival. It is not part of the payment you make through Umuti Express. The pharmacy is responsible for delivering your order, for the people who deliver it and for the condition of the medicines when they reach you.",
        "To make the delivery possible we share your name, phone number and delivery address with the pharmacy. Please check the parcel on receipt and tell the pharmacy straight away if anything is missing or damaged.",
      ],
    },
    {
      heading: "Cancellations, returns and refunds",
      blocks: [
        "You can cancel an order that is waiting for prescription review or for payment from the Track order page. No payment is taken for an order that has not been paid for.",
        "Once an order has been paid for, contact the pharmacy through the Chat page as soon as possible. The pharmacy can cancel the order if it has not yet been prepared.",
        "You will be refunded the amount you paid for the affected items if the pharmacy cancels or cannot supply your order, or if an item you receive is not what you ordered, is damaged or defective, is past its expiry date, or was dispensed in error. Refunds are paid to the mobile money number used for the order. The time they take depends on your mobile money provider.",
        "For safety reasons, medicines that have been supplied correctly cannot be returned or exchanged.",
        "Nothing in this section limits any right you have under the laws of Zambia.",
      ],
    },
    {
      heading: "Your health and your responsibilities",
      blocks: [
        "Using Umuti Express does not replace a consultation with a doctor, pharmacist or other health professional. Please read our Medical Disclaimer. Take medicines only as directed, tell the pharmacist about your conditions, allergies and other medicines, and seek urgent medical help in an emergency.",
        "Tell the pharmacy about any suspected side effect or problem with a medicine you have received.",
      ],
    },
    {
      heading: "Acceptable use",
      blocks: [
        "You agree not to:",
        {
          list: [
            "use the service for any unlawful purpose or to obtain medicines for resale or misuse;",
            "submit false, forged or altered prescriptions, or use another person's prescription without authority;",
            "give false details, or use payment methods you are not entitled to use;",
            "harass, threaten or abuse pharmacy staff, riders or our team;",
            "copy, scrape or extract data from the service by automated means, or interfere with its operation or security; or",
            "attempt to access accounts, orders, prescriptions or other information that is not yours.",
          ],
        },
      ],
    },
    {
      heading: "What you send us",
      blocks: [
        "You keep ownership of the messages, prescriptions and other material you send through the service. You give us permission to store and process them, and to share them with the pharmacy handling your order, to the extent needed to provide the service. You must not send anything that is unlawful or that you do not have the right to share.",
      ],
    },
    {
      heading: "Your privacy",
      blocks: [
        "Our Privacy Policy explains what personal and health information we collect, why, who we share it with and your rights. Prescriptions and other health information are shared only with the pharmacy handling the order they belong to.",
      ],
    },
    {
      heading: "Suspending or closing an account",
      blocks: [
        "You may close your account at any time by contacting us. We may suspend or close an account if you break these terms, if we are required to by law or a regulator, or if we reasonably believe the account is being used to cause harm or fraud. Closing an account does not affect orders already placed, which we will see through, or rights that have already arisen.",
      ],
    },
    {
      heading: "Our responsibility to you",
      blocks: [
        "We will provide the platform with reasonable care and skill. We do not guarantee that it will always be available or free of errors, and we may suspend it for maintenance.",
        "Because pharmacies are independent, we are not responsible for the quality, labelling, storage or dispensing of medicines they supply, for the advice their pharmacists give, or for their delivery arrangements, except where the law makes us responsible. Your remedies for those matters are against the pharmacy, and we will help you raise them.",
        "Nothing in these terms excludes or limits liability for death or personal injury caused by negligence, for fraud, or for any liability that cannot be excluded or limited by law. Subject to that, we are not liable for loss that was not a reasonably foreseeable result of our breach, and our total liability to you for any one order is limited to the amount you paid for that order.",
      ],
    },
    {
      heading: "Changes",
      blocks: [
        "We may update these terms, for example to reflect changes to the service or the law. We will publish the new version with its date, and tell you in the service where a change is significant. If you keep using the service after a change takes effect, you accept the new version. If you do not agree with it, you may close your account.",
      ],
    },
    {
      heading: "Complaints, disputes and governing law",
      blocks: [
        "If you have a problem with a medicine or an order, raise it with the pharmacy first. If it is not resolved, or the problem is with the platform or a payment, contact us {{contact}}. We will acknowledge your complaint promptly and aim to resolve it fairly.",
        "These terms are governed by the laws of the Republic of Zambia. The courts of Zambia have jurisdiction over any dispute arising from them, subject to any right you have to bring a claim elsewhere under consumer protection law. You may also contact the Competition and Consumer Protection Commission about a consumer complaint.",
      ],
    },
    {
      heading: "General",
      blocks: [
        "These terms, together with the Privacy Policy and Medical Disclaimer, are the whole agreement between you and us about the service. If a part of them is found to be unenforceable, the rest continues to apply. If we do not enforce a right straight away, we have not given it up. We may transfer our rights and obligations to another business that takes over the service; you may not transfer yours.",
        "We may give you notices through the service, by email or by SMS to the details on your account.",
      ],
    },
    {
      heading: "Contact",
      blocks: ["You can contact us {{contact}}."],
    },
  ],
};
