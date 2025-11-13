// Common constants
export const COMMON_CONSTANTS = {
  COMPANY_NAME: "EasyHome",
  SUPPORT_EMAIL: "support@easyhome.com",
  LEGAL_EMAIL: "legal@easyhome.com",
  PRIVACY_EMAIL: "privacy@easyhome.com",
  DPO_EMAIL: "dpo@easyhome.com",
  PHONE_NUMBER: "+91 7017283279",
  PHONE_NUMBER_FORMATTED: "+91 7017283279",
  ADDRESS: "",
  SUPPORT_HOURS: "",
  SUPPORT_HOURS_SHORT: "",
  WEEKEND_HOURS: "Saturday - Sunday: 10:00 AM - 4:00 PM IST",
  LAST_UPDATED: "September 17, 2025",
  BUTTON_TEXT: {
    OK: "OK",
    SEND_MESSAGE: "Send Message",
    SENDING: "Sending...",
    CONTACT_SUPPORT: "Contact Support",
    CONTACT_PRIVACY_TEAM: "Contact Privacy Team"
  }
};

export const HELP_CONSTANTS = {
  // Header titles
  HELP_CENTER_TITLE: "Help Center",
  
  // Welcome section
  WELCOME_TITLE: "How can we help you?",
  WELCOME_SUBTITLE: "Find answers to common questions or contact our support team",
  
  // Section titles
  QUICK_ACTIONS_TITLE: "Quick Actions",
  FAQ_TITLE: "Frequently Asked Questions",
  STILL_NEED_HELP_TITLE: "Still Need Help?",
  
  // Contact info
  CONTACT_INFO: {
    EMAIL: {
      TITLE: "Email Support",
      VALUE: COMMON_CONSTANTS.SUPPORT_EMAIL
    },
    PHONE: {
      TITLE: "Phone Support",
      VALUE: COMMON_CONSTANTS.PHONE_NUMBER_FORMATTED
    },
    HOURS: {
      TITLE: "Support Hours",
      VALUE: COMMON_CONSTANTS.SUPPORT_HOURS_SHORT
    }
  },
  
  // Quick actions
  QUICK_ACTIONS: [
    {
      id: 1,
      title: COMMON_CONSTANTS.BUTTON_TEXT.CONTACT_SUPPORT,
      subtitle: "Get help from our team",
      icon: "headset",
      route: "/screens/contactSupport"
    },
    {
      id: 2,
      title: "Privacy Policy",
      subtitle: "Read our privacy policy",
      icon: "shield-checkmark",
      route: "/screens/privacyPolicy"
    },
    {
      id: 3,
      title: "Terms of Service",
      subtitle: "View terms and conditions",
      icon: "document-text",
      route: "/screens/termsOfService"
    },
    {
      id: 4,
      title: "Video Tutorials",
      subtitle: "Learn how to use the app",
      icon: "play-circle",
      url: "https://youtube.com/@easyhome"
    }
  ],
  
  // FAQ data
  FAQ_DATA: [
    {
      id: 1,
      question: "How do I list my property?",
      answer: "To list your property, go to your profile and tap 'Add Property'. Fill in all the required details including photos, location, rent amount, and amenities. Make sure to provide accurate information to attract genuine seekers.",
      category: "Property Management"
    },
    {
      id: 2,
      question: "How do I search for properties?",
      answer: "Use the search feature on the explore page. You can filter by location, price range, property type, and amenities. Save your favorite properties to your wishlist for easy access later.",
      category: "Property Search"
    },
    {
      id: 3,
      question: "How do I contact property owners?",
      answer: "You can contact property owners through the messaging feature available on each property listing. Make sure to be respectful and provide relevant information about yourself.",
      category: "Communication"
    },
    {
      id: 4,
      question: "How do I report inappropriate content?",
      answer: "If you encounter any inappropriate content or behavior, please report it immediately using the report button available on listings or user profiles. Our team will investigate promptly.",
      category: "Safety"
    },
    {
      id: 5,
      question: "Can I modify my property listing?",
      answer: "Yes, you can edit your property listings anytime. Go to 'All Properties' in your profile, select the property you want to edit, and update the information as needed.",
      category: "Property Management"
    },
    {
      id: 6,
      question: "How do I delete my account?",
      answer: "You can delete your account from Settings > Delete Account. Please note that this action is irreversible and all your data will be permanently removed.",
      category: "Account"
    },
    {
      id: 7,
      question: "What if I forget my password?",
      answer: "You can reset your password from the login screen by tapping 'Forgot Password'. Enter your email address and follow the instructions sent to your email.",
      category: "Account"
    }
  ]
};

export const CONTACT_SUPPORT_CONSTANTS = {
  // Header title
  CONTACT_SUPPORT_TITLE: COMMON_CONSTANTS.BUTTON_TEXT.CONTACT_SUPPORT,
  
  // Section titles
  QUICK_CONTACT_METHODS_TITLE: "Quick Contact Methods",
  QUICK_CONTACT_SUBTITLE: "Choose the fastest way to get help",
  DETAILED_MESSAGE_TITLE: "Or Send Us a Detailed Message",
  
  // Form labels
  CATEGORY_LABEL: "What can we help you with? *",
  SUBJECT_LABEL: "Subject *",
  MESSAGE_LABEL: "Message *",
  
  // Placeholders
  SUBJECT_PLACEHOLDER: "Brief description of your issue",
  MESSAGE_PLACEHOLDER: "Please provide as much detail as possible to help us assist you better...",
  
  // Button text
  SEND_BUTTON_TEXT: "Report Problem",
  SENDING_TEXT: "Submitting...",
  
  // Categories
  CATEGORIES: [
    {
      id: "technical",
      title: "Technical Issue",
      subtitle: "App crashes, bugs, or functionality problems",
      icon: "bug"
    },
    {
      id: "account",
      title: "Account Problem",
      subtitle: "Login issues, account settings, or verification",
      icon: "person-circle"
    },
    {
      id: "property",
      title: "Property Listing",
      subtitle: "Issues with listing or viewing properties",
      icon: "home"
    },
    {
      id: "other",
      title: "Other",
      subtitle: "General questions or feedback",
      icon: "chatbubble-ellipses"
    }
  ],
  
  // Contact methods
  CONTACT_METHODS: [
    {
      id: "whatsapp",
      title: "WhatsApp Support",
      subtitle: COMMON_CONSTANTS.PHONE_NUMBER_FORMATTED,
      description: "Quick support via WhatsApp (Available 24/7)",
      icon: "logo-whatsapp"
    }
  ],
  
  // Alert messages
  ALERTS: {
    MISSING_INFO: {
      TITLE: "Missing Information",
      MESSAGE: "Please fill in all required fields"
    },
    SUCCESS: {
      TITLE: "Message Sent Successfully",
      MESSAGE: "Thank you for contacting us! We'll get back to you within 24 hours."
    },
    ERROR: {
      TITLE: "Error",
      MESSAGE: "Failed to send message. Please try again."
    }
  },
  
  // Support hours info
  SUPPORT_HOURS: {
    TITLE: "Support Hours",
    WEEKDAYS: COMMON_CONSTANTS.SUPPORT_HOURS,
    WEEKENDS: COMMON_CONSTANTS.WEEKEND_HOURS
  },
  
  // Email templates
  EMAIL_TEMPLATES: {
    SUBJECT_PREFIX: `${COMMON_CONSTANTS.COMPANY_NAME} Support`,
    WHATSAPP_PREFIX: "Hi! I need help with"
  }
};

export const PRIVACY_POLICY_CONSTANTS = {
  TITLE: "Privacy Policy",
  INTRO_TITLE: "Your Privacy Matters",
  LAST_UPDATED: `Last updated: ${COMMON_CONSTANTS.LAST_UPDATED}`,
  INTRO_TEXT_1: `At ${COMMON_CONSTANTS.COMPANY_NAME}, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile application.`,
  INTRO_TEXT_2: `By using ${COMMON_CONSTANTS.COMPANY_NAME}, you agree to the collection and use of information in accordance with this policy.`,
  SUMMARY_TITLE: "Quick Summary",
  SUMMARY_POINTS: [
    "We only collect data necessary to provide our services",
    "Your data is encrypted and securely stored",
    "You control what information you share",
    "We never sell your personal information"
  ],
  FOOTER_TITLE: "Questions About Privacy?",
  FOOTER_SUBTITLE: "Contact our privacy team if you have any questions or concerns.",
  CONTACT_BUTTON_TEXT: COMMON_CONSTANTS.BUTTON_TEXT.CONTACT_PRIVACY_TEAM,
  SECTIONS: [
    {
      id: 1,
      title: "1. Information We Collect",
      content: `We collect information you provide directly to us, such as when you create an account, list a property, or contact us for support.\n\nPersonal Information:\n• Name, email address, phone number\n• Profile photos and property images\n• Location data and preferences\n• Payment information (processed securely by third parties)\n\nUsage Information:\n• App usage patterns and preferences\n• Device information and identifiers\n• Log data and analytics information`
    },
    {
      id: 2,
      title: "2. How We Use Your Information",
      content: `We use the information we collect to:\n\n• Provide, maintain, and improve our services\n• Process transactions and send related information\n• Send technical notices and support messages\n• Communicate about products, services, and events\n• Monitor and analyze trends and usage\n• Detect and prevent fraudulent transactions\n• Comply with legal obligations`
    },
    {
      id: 3,
      title: "3. Information Sharing",
      content: `We may share your information in the following situations:\n\nWith Other Users:\n• Property listings and profile information are visible to other users\n• Contact information may be shared to facilitate communications\n\nWith Service Providers:\n• Payment processors for transaction handling\n• Analytics providers for app improvement\n• Customer service platforms\n\nLegal Requirements:\n• When required by law or to protect our rights\n• To prevent fraud or security threats\n• With your consent or at your direction`
    },
    {
      id: 4,
      title: "4. Data Security",
      content: `We implement appropriate security measures to protect your personal information:\n\n• Encryption of data in transit and at rest\n• Regular security assessments and updates\n• Access controls and authentication requirements\n• Secure payment processing through certified providers\n\nHowever, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      id: 5,
      title: "5. Your Rights and Choices",
      content: `You have several rights regarding your personal information:\n\nAccount Information:\n• Update your profile and preferences at any time\n• Deactivate or delete your account\n\nCommunication Preferences:\n• Opt out of promotional emails\n• Manage notification settings\n• Control visibility of your information\n\nData Access:\n• Request a copy of your personal data\n• Request correction of inaccurate information\n• Request deletion of your data (subject to legal requirements)`
    },
    {
      id: 6,
      title: "6. Location Information",
      content: `We collect and use location information to:\n\n• Display relevant property listings in your area\n• Provide location-based search and filtering\n• Improve our mapping and navigation features\n• Analyze usage patterns and improve services\n\nYou can control location access through your device settings. Disabling location services may limit some app functionality.`
    },
    {
      id: 7,
      title: "7. Cookies and Tracking",
      content: `We use cookies and similar technologies to:\n\n• Remember your preferences and settings\n• Analyze app performance and usage\n• Provide personalized content and advertisements\n• Improve security and prevent fraud\n\nYou can manage cookie preferences through your device settings, though this may affect app functionality.`
    },
    {
      id: 8,
      title: "8. Third-Party Services",
      content: `Our app may integrate with third-party services such as:\n\n• Social media platforms for account creation\n• Payment processors for transactions\n• Analytics services for app improvement\n• Mapping services for location features\n\nThese services have their own privacy policies, and we encourage you to review them.`
    },
    {
      id: 9,
      title: "9. Data Retention",
      content: `We retain your information for as long as necessary to:\n\n• Provide our services to you\n• Comply with legal obligations\n• Resolve disputes and enforce agreements\n• Improve our services\n\nWhen you delete your account, we will delete or anonymize your personal information, except where retention is required by law.`
    },
    {
      id: 10,
      title: "10. Children's Privacy",
      content: `Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.\n\nIf you become aware that a child has provided us with personal information, please contact us immediately, and we will take steps to remove such information.`
    },
    {
      id: 11,
      title: "11. International Transfers",
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this privacy policy.`
    },
    {
      id: 12,
      title: "12. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by:\n\n• Posting the new policy in the app\n• Sending an email notification\n• Displaying a prominent notice\n\nYour continued use of the service after such modifications constitutes acceptance of the updated policy.`
    },
    {
      id: 13,
      title: "13. Contact Us",
      content: `If you have questions about this Privacy Policy or how we handle your information, please contact us at:\n\nEmail: ${COMMON_CONSTANTS.PRIVACY_EMAIL}\nPhone: ${COMMON_CONSTANTS.PHONE_NUMBER_FORMATTED}\nAddress: ${COMMON_CONSTANTS.ADDRESS}\n\nData Protection Officer: ${COMMON_CONSTANTS.DPO_EMAIL}`
    }
  ]
};

export const TERMS_OF_SERVICE_CONSTANTS = {
  TITLE: "Terms of Service",
  LAST_UPDATED: `Last updated: ${COMMON_CONSTANTS.LAST_UPDATED}`,
  INTRO_TEXT_1: `Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the ${COMMON_CONSTANTS.COMPANY_NAME} mobile application (the "Service") operated by ${COMMON_CONSTANTS.COMPANY_NAME} ("us", "we", or "our").`,
  INTRO_TEXT_2: "Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who access or use the Service.",
  FOOTER_TITLE: "Need Help?",
  FOOTER_SUBTITLE: "If you have questions about these terms, please contact our support team.",
  CONTACT_BUTTON_TEXT: COMMON_CONSTANTS.BUTTON_TEXT.CONTACT_SUPPORT,
  SECTIONS: [
    {
      id: 1,
      title: "1. Acceptance of Terms",
      content: `By accessing and using ${COMMON_CONSTANTS.COMPANY_NAME}, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 2,
      title: "2. Use License",
      content: `Permission is granted to temporarily download one copy of ${COMMON_CONSTANTS.COMPANY_NAME} per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n      \n• Modify or copy the materials\n• Use the materials for any commercial purpose or for any public display\n• Attempt to reverse engineer any software contained in ${COMMON_CONSTANTS.COMPANY_NAME}\n• Remove any copyright or other proprietary notations from the materials`
    },
    {
      id: 3,
      title: "3. User Accounts",
      content: "When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for any activities that occur under your account.\n      \nYou must not:\n• Use someone else's account without permission\n• Create accounts for fraudulent purposes\n• Share your account credentials with others\n• Use offensive or inappropriate usernames"
    },
    {
      id: 4,
      title: "4. Property Listings",
      content: `Property providers are solely responsible for the accuracy and completeness of their listings. ${COMMON_CONSTANTS.COMPANY_NAME} does not verify the accuracy of listings or guarantee the availability of properties.\n      \nProperty providers agree to:\n• Provide accurate and current information\n• Update listings when properties become unavailable\n• Respond to inquiries in a timely manner\n• Not discriminate against users based on protected characteristics`
    },
    {
      id: 5,
      title: "5. User Conduct",
      content: "Users must not:\n• Post false, misleading, or fraudulent content\n• Harass, threaten, or intimidate other users\n• Use the service for illegal activities\n• Attempt to gain unauthorized access to other accounts\n• Post spam or unsolicited communications\n• Violate any applicable laws or regulations"
    },
    {
      id: 6,
      title: "6. Privacy and Data Protection",
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using ${COMMON_CONSTANTS.COMPANY_NAME}, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      id: 7,
      title: "7. Payment Terms",
      content: `All payments are processed securely through third-party payment processors. ${COMMON_CONSTANTS.COMPANY_NAME} does not store payment information. Users are responsible for all charges incurred under their account.\n      \nRefund policies may vary based on the specific transaction and are subject to our refund policy terms.`
    },
    {
      id: 8,
      title: "8. Intellectual Property",
      content: `The service and its original content, features, and functionality are and will remain the exclusive property of ${COMMON_CONSTANTS.COMPANY_NAME} and its licensors. The service is protected by copyright, trademark, and other laws.`
    },
    {
      id: 9,
      title: "9. Termination",
      content: "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms.\n      \nUpon termination, your right to use the service will cease immediately."
    },
    {
      id: 10,
      title: "10. Disclaimer",
      content: `The information on this app is provided on an "as is" basis. To the fullest extent permitted by law, ${COMMON_CONSTANTS.COMPANY_NAME} excludes all representations, warranties, obligations, and liabilities arising out of or in connection with your use of this service.\n      \n${COMMON_CONSTANTS.COMPANY_NAME} makes no representation or warranty that the service will meet your requirements or be available uninterrupted.`
    },
    {
      id: 11,
      title: "11. Limitation of Liability",
      content: `In no event shall ${COMMON_CONSTANTS.COMPANY_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.`
    },
    {
      id: 12,
      title: "12. Changes to Terms",
      content: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.\n      \nBy continuing to access or use our service after any revisions become effective, you agree to be bound by the revised terms."
    },
    {
      id: 13,
      title: "13. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at:\n\nEmail: ${COMMON_CONSTANTS.LEGAL_EMAIL}\nPhone: ${COMMON_CONSTANTS.PHONE_NUMBER_FORMATTED}\nAddress: ${COMMON_CONSTANTS.ADDRESS}`
    }
  ]
};