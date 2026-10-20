import type { LegalContent } from "./types";

export const partnerAgreement: LegalContent = {
  slug: "partner-agreement",
  type: "PARTNER",
  title: "Pharmacy Partner Agreement",
  version: "1.0",
  effectiveDate: "20 October 2026",
  summary: "The agreement between Umuti Express and each pharmacy that lists medicines on the platform.",
  sections: [
    {
      heading: "Parties and acceptance",
      blocks: [
        "This agreement is between {{company}} (\"Umuti Express\") and the pharmacy named in the application (\"the Pharmacy\"). The person who accepts it on the Pharmacy's behalf confirms that they are authorised to bind the Pharmacy.",
        "The Pharmacy is bound by this agreement from the moment it is accepted in the application, and by each later version from the moment its owner accepts that version.",
      ],
    },
    {
      heading: "What Umuti Express provides",
      blocks: [
        "Umuti Express operates an online marketplace through which customers find and order medicines from independent pharmacies. It provides the Pharmacy with a dashboard to list products, manage stock and prices, receive and prepare orders, review prescriptions and view its balance. It collects customers' payments, and pays the Pharmacy as set out in this agreement.",
        "The Pharmacy is an independent business. Nothing in this agreement makes the Pharmacy an employee, agent or partner of Umuti Express, or Umuti Express a pharmacy. Each sale of a medicine is a contract between the customer and the Pharmacy, and the Pharmacy is the supplier.",
        "This agreement is not exclusive. The Pharmacy may sell through other channels, and Umuti Express may work with other pharmacies.",
      ],
    },
    {
      heading: "The Pharmacy's status and warranties",
      blocks: [
        "The Pharmacy confirms, and promises to keep true for as long as it is on the platform, that:",
        {
          list: [
            "it is lawfully established in Zambia and holds every registration, licence and permit required to operate a pharmacy and to supply the medicines it lists, including those issued by the Zambia Medicines Regulatory Authority and the Health Professions Council of Zambia, or their successors;",
            "the documents it has given Umuti Express are genuine, complete and current, and it will upload replacements before any of them expire;",
            "every medicine it lists was obtained from a lawful source, is within its expiry date, and is stored and handled as the law and the manufacturer require; and",
            "it will tell Umuti Express at once if a licence or registration is suspended, withdrawn or made subject to conditions, or if it becomes the subject of an investigation relating to its practice.",
          ],
        },
      ],
    },
    {
      heading: "Staff and pharmacists",
      blocks: [
        "The owner invites staff to the dashboard through single-use links and is responsible for who joins, for removing people who leave, and for everything done under the Pharmacy's accounts. Staff may join only if they work at the Pharmacy.",
        "Only a pharmacist whose licence and practising certificate Umuti Express has verified may open or decide a prescription. Verification lasts only while the practising certificate is in date. The Pharmacy must not allow anyone else to review a prescription, and must not share a login between people.",
      ],
    },
    {
      heading: "Listing products",
      blocks: [
        "The Pharmacy chooses the products it lists from the shared catalogue, or proposes a new product, which stays hidden from customers until Umuti Express approves it. Umuti Express alone sets a product's classification (general sale, pharmacy only, or prescription only), and the Pharmacy must sell the product in line with it.",
        "The Pharmacy sets its own prices in kwacha and keeps its stock figures accurate. It must not list a product that it cannot supply, that has expired, or that is prohibited, counterfeit, unregistered or recalled.",
        "Listings are factual. The Pharmacy must not use the platform to advertise: no promotional claims, comparisons, discounts presented as inducements, urgency, or statements about what a medicine will do for a customer beyond the product details held in the catalogue.",
      ],
    },
    {
      heading: "Orders, prescriptions and supply",
      blocks: [
        "The Pharmacy will check its orders regularly and deal with them promptly. For an order with a prescription item, a verified pharmacist will review the prescription, approve it only if it is genuine and appropriate to supply against, and give the customer a clear reason when it is not approved. One refusal cancels the order.",
        "Once the customer has paid, the Pharmacy will prepare the order, supply the correct medicines in the right quantities and within their expiry date, with appropriate counselling and labelling, and move the order through its stages in the dashboard so that the customer can follow it.",
        "The Pharmacy remains responsible for the medicines it supplies and for compliance with the laws that apply to dispensing, record keeping, storage and counselling. It will cooperate with any recall, complaint or inquiry by a customer, a regulator or Umuti Express, and will promptly refund or replace anything supplied in error.",
        "The Pharmacy may decline or cancel an order it cannot lawfully or safely fulfil. If it does, the customer is refunded in full.",
      ],
    },
    {
      heading: "Delivery",
      blocks: [
        "Delivery is optional. A Pharmacy that offers it arranges it directly with the customer, sets its own terms and any charge, and collects the charge on arrival. Delivery is not part of the payment Umuti Express collects and Umuti Express is not a party to it.",
        "The Pharmacy is responsible for the people who make deliveries, for the condition of the medicines on arrival, and for handing the order only to the customer. The delivery slip that the dashboard prints contains only the order code, first name, phone number and address, and the Pharmacy must not add the names of medicines to it.",
      ],
    },
    {
      heading: "Customer information",
      blocks: [
        "Customers' names, phone numbers, addresses and prescriptions are shared with the Pharmacy only so that it can fulfil the order. The Pharmacy must use that information for nothing else, including marketing, must keep it confidential and secure, must not share it except as the law requires, and must not copy a prescription image outside the platform except as the law requires it to keep dispensing records.",
        "In relation to the customer information it receives, the Pharmacy is responsible for complying with the Data Protection Act of Zambia and any other law that applies to it. It will tell Umuti Express without delay, and in any case within 72 hours, of becoming aware of any loss of or unauthorised access to customer information, and will cooperate in dealing with it.",
        "Umuti Express records when prescriptions and verification documents are opened, and the Pharmacy agrees to that record being kept.",
      ],
    },
    {
      heading: "Fees, payment and payouts",
      blocks: [
        "Umuti Express collects the customer's payment as the Pharmacy's collection agent. A customer's payment to Umuti Express discharges the customer's obligation to pay the Pharmacy for that order.",
        "Umuti Express keeps a commission on the price of medicines sold through the platform. At the date of this version the commission is ten per cent (10%) of the price of the medicines in the order. Delivery charges are excluded because they are not collected through the platform. Umuti Express bears the payment processing fees charged by its payment provider and pays them out of its commission, so the Pharmacy receives the order value less the commission and nothing else is deducted for processing.",
        "The Pharmacy's balance is the total of its sales less commission, refunds and any other amounts the Pharmacy owes under this agreement. Umuti Express holds the balance on the Pharmacy's behalf until it is paid out, records it separately from its own money and does not use it for its own purposes. At the date of this version the Pharmacy is entitled to one payout in each calendar month at no charge, subject to a minimum payout of K50. The Pharmacy may request further payouts in the same month. Umuti Express will tell the Pharmacy the payout fee before it is requested and will deduct it from that payout.",
        "Umuti Express may set off against the balance any refund it has made for the Pharmacy's order and any other sum properly due to it. Umuti Express may withhold payment while it investigates fraud, a complaint or a legal claim about an order.",
        "Umuti Express may change the commission, the payout allowance, the minimum payout or the payout fee by giving at least 30 days' written notice through the dashboard. A change applies to orders placed after the notice period ends. If the Pharmacy does not accept a change it may end this agreement under section 12.",
        "The Pharmacy is responsible for its own taxes and for any tax invoices or receipts it must give to customers. Umuti Express will provide statements of the sales, commission and payouts recorded for the Pharmacy.",
      ],
    },
    {
      heading: "Complaints and quality",
      blocks: [
        "The Pharmacy will deal with customer complaints about its medicines, advice and delivery fairly and promptly, and will keep Umuti Express informed of any complaint that suggests a safety risk. Umuti Express may pass customers' complaints to the Pharmacy, may remove a listing while a safety concern is examined, and may suspend a Pharmacy that is the subject of repeated or serious complaints.",
      ],
    },
    {
      heading: "Use of names and the platform",
      blocks: [
        "The Pharmacy allows Umuti Express to display its name, logo, address, opening hours and product listings on the platform for as long as it is listed. Neither party may use the other's name or marks for any other purpose without written consent. The platform and its software remain the property of Umuti Express.",
        "The Pharmacy will use the platform only for lawful purposes, will not interfere with it or try to reach data that is not its own, and will not use it to direct customers away from the platform for orders that began on it.",
      ],
    },
    {
      heading: "Term, suspension and ending the agreement",
      blocks: [
        "This agreement starts when the Pharmacy's application is approved and continues until ended. Either party may end it by giving 30 days' written notice.",
        "Umuti Express may suspend the Pharmacy's listing at once, or end this agreement with immediate effect, if the Pharmacy breaches this agreement in a way that matters, loses or is at risk of losing a licence or registration, supplies or is suspected of supplying medicines unlawfully, endangers customers, or acts dishonestly. It will tell the Pharmacy the reason, which is also shown in the dashboard.",
        "When the agreement ends the Pharmacy will complete or cancel its open orders. Umuti Express will pay out the balance due to the Pharmacy, less amounts it is entitled to deduct. Sections that by their nature should continue, including those on customer information, payment, liability and governing law, continue after the agreement ends.",
      ],
    },
    {
      heading: "Liability and indemnity",
      blocks: [
        "The Pharmacy is responsible for the medicines it supplies and for the advice it gives, and will indemnify Umuti Express against claims, losses and costs arising from medicines it supplies, from its breach of this agreement or of the law, or from the acts of its staff and delivery personnel.",
        "Umuti Express does not warrant that the platform will be uninterrupted or error free. Nothing in this agreement limits liability that cannot be limited by law. Subject to that, Umuti Express is not liable for loss of profit, loss of business or indirect loss, and its total liability to the Pharmacy under this agreement in any period of twelve months is limited to the commission it received from the Pharmacy in that period.",
        "The Pharmacy will maintain insurance cover for its business, including professional indemnity and public liability, at a level that is appropriate for a pharmacy and that the law requires.",
      ],
    },
    {
      heading: "Confidentiality",
      blocks: [
        "Each party will keep confidential the non-public information it receives from the other under this agreement, use it only to perform this agreement, and disclose it only to those who need it for that purpose or where the law requires.",
      ],
    },
    {
      heading: "Changes, notices and general terms",
      blocks: [
        "Umuti Express may update this agreement by publishing a new version and giving the Pharmacy's owner at least 30 days' notice through the dashboard. The Pharmacy's owner must accept the new version in the dashboard. If they do not, the Pharmacy may end the agreement under section 12 and the current version continues to apply until it ends.",
        "Notices may be given through the dashboard or to the contact details held on the Pharmacy's account. This agreement, with the documents it refers to, is the whole agreement on its subject. If a provision is unenforceable the rest continues to apply, and a right is not lost because it is not exercised at once. The Pharmacy may not transfer this agreement without Umuti Express's written consent.",
      ],
    },
    {
      heading: "Governing law and disputes",
      blocks: [
        "This agreement is governed by the laws of the Republic of Zambia. The parties will first try to resolve any dispute by good-faith discussion between senior representatives for 30 days. If the dispute is not resolved, the courts of Zambia have jurisdiction over it.",
        "Umuti Express can be contacted {{contact}}.",
      ],
    },
  ],
};
