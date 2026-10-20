/** Who the legal documents speak for, and how to reach them. Set the email in the environment. */
export const COMPANY = {
  name: "Umuti Express",
  place: "Lusaka, Zambia",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || null,
};

/** The sentence the legal documents use wherever they say how to get in touch. */
export function contactLine() {
  return COMPANY.email
    ? `by email at ${COMPANY.email} or through the Chat page in your account`
    : "through the Chat page in your account";
}

/** Fills the placeholders legal text may contain. */
export function fillLegalText(text: string) {
  return text.replaceAll("{{contact}}", contactLine()).replaceAll("{{company}}", COMPANY.name);
}
