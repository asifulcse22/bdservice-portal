import { ServiceDefinition } from './types';

export const SYSTEM_SERVICES: ServiceDefinition[] = [

  {
    id: 'new-voter',
    title: 'New Voter Registration (Form-2)',
    banglaTitle: 'নতুন ভোটার আবেদন (ফরম-২)',
    titleEn: 'NEW VOTER REGISTRATION (FORM-2)',
    category: 'nid',
    fee: 0,
    price: 0,
    popular: true,
    isPopular: true,
    tag: 'EC FORM-2 • নতুন ভোটার',
    deliveryTime: '২৪-৭২ ঘণ্টা (অনলাইন ফরম-২ ও স্লিপ)',
    processingTime: '২৪-৭২ ঘণ্টা',
    description: 'বাংলাদেশ নির্বাচন কমিশনের অফিশিয়াল ফরম-২ অনুযায়ী নতুন ভোটার ও এনআইডি নিবন্ধনের পূর্ণাঙ্গ আবেদন',
    icon: '🗳️',
    iconType: 'credit-card',
    color: 'bg-purple-600',
    inputLabel: 'আবেদনকারীর নাম (বাংলা ও ইংরেজি)',
    inputPlaceholder: 'জন্ম সনদ অনুযায়ী নাম লিখুন',
  },

  // ─────────────────────────────────────────────
  // 🪪 NID সেবা ও আইডি কার্ড সংশোধন
  // ─────────────────────────────────────────────
  { id: 'server-copy', title: 'Server Copy', banglaTitle: 'সার্ভার কপি', titleEn: 'Server Copy', description: 'NID কার্ডের তথ্য যাচাই (সার্ভার কপি)', icon: '📋', color: 'bg-blue-400', category: 'nid', fee: 85, price: 85, popular: true, inputLabel: 'আইডি নাম্বার ও জন্ম তারিখ', inputPlaceholder: 'আইডি নাম্বার / জন্ম তারিখ (DD/MM/YYYY)' },
  { id: 'sign-copy', title: 'Sign Copy', banglaTitle: 'সাইন কপি', titleEn: 'Sign Copy', description: 'NID কার্ডের সাইন কপি সংগ্রহ', icon: '🖋️', color: 'bg-blue-500', category: 'nid', fee: 80, price: 80, inputLabel: 'ভোটার/আইডি নাম্বার', inputPlaceholder: 'ভোটার নাম্বার বা আইডি নাম্বার দিন' },
  { id: 'nid-pdf', title: 'NID Card PDF', banglaTitle: 'NID কার্ড PDF', titleEn: 'NID Card PDF', description: 'অরিজিনাল জাতীয় পরিচয়পত্রের PDF', icon: '🪪', color: 'bg-indigo-600', category: 'nid', fee: 95, price: 95, popular: true, inputLabel: 'আইডি নাম্বার ও জন্ম তারিখ', inputPlaceholder: 'আইডি নাম্বার / জন্ম তারিখ (DD/MM/YYYY)' },
  { id: 'form-sign-copy', title: 'Form to Sign Copy', banglaTitle: 'ফরম নং → সাইন কপি', titleEn: 'Form to Sign Copy', description: 'ফরম নাম্বার দিয়ে সাইন কপি সংগ্রহ', icon: '📝', color: 'bg-indigo-500', category: 'nid', fee: 23, price: 23, inputLabel: 'ফরম নাম্বার', inputPlaceholder: 'ফরম নাম্বার দিন' },
  { id: 'nid-voter-number', title: 'NID service by Voter Number', banglaTitle: 'NID ভোটার নাম্বার দিয়ে সার্ভিস', titleEn: 'NID service by Voter Number', description: 'ভোটার নাম্বার দিয়ে NID সেবা', icon: '🗳️', color: 'bg-teal-500', category: 'nid', fee: 45, price: 45, inputLabel: 'ভোটার নাম্বার', inputPlaceholder: 'ভোটার নাম্বার দিন' },
  { id: 'official-server-copy', title: 'Official Server Copy', banglaTitle: 'অফিসিয়াল সার্ভার কপি', titleEn: 'Official Server Copy', description: 'সরকারি অফিসিয়াল সার্ভার কপি', icon: '🏛️', color: 'bg-blue-800', category: 'nid', fee: 59, price: 59, inputLabel: 'আইডি নাম্বার ও জন্ম তারিখ', inputPlaceholder: 'আইডি নাম্বার / জন্ম তারিখ (DD/MM/YYYY)' },
  
  // 🪪 আইডি কার্ড সংশোধন (বিশেষ সেবা - ৩ দিন ডেলিভারি)
  { 
    id: 'nid-full-name-correction', 
    title: 'Full Name Correction', 
    banglaTitle: 'পুরো নাম সংশোধন', 
    titleEn: 'Full Name Correction', 
    description: 'জাতীয় পরিচয়পত্রের সম্পূর্ণ নাম সংশোধন আবেদন (৩ দিন সময়)', 
    icon: '✏️', 
    color: 'bg-blue-600', 
    category: 'nid', 
    fee: 3850, 
    price: 3850, 
    deliveryTime: '৩ দিন সময়',
    popular: true, 
    inputLabel: 'সংশোধিত তথ্য চাহিদা', 
    inputPlaceholder: 'কাঙ্ক্ষিত সঠিক পুরো নাম ও সংশোধনের বিবরণ বিস্তারিত লিখুন' 
  },
  { 
    id: 'nid-age-correction', 
    title: 'Age Correction Per Year', 
    banglaTitle: 'বয়স প্রতি বছরের জন্য', 
    titleEn: 'Age Correction Per Year', 
    description: 'জন্মতারিখ/বয়স সংশোধন প্রতি বছরের হিসাব অনুযায়ী (৩ দিন সময়)', 
    icon: '📅', 
    color: 'bg-indigo-600', 
    category: 'nid', 
    fee: 4500, 
    price: 4500, 
    deliveryTime: '৩ দিন সময়',
    popular: true, 
    inputLabel: 'সংশোধিত তথ্য চাহিদা', 
    inputPlaceholder: 'বর্তমান বয়স, কাঙ্ক্ষিত বয়স এবং কত বছর সংশোধন চান তা লিখুন' 
  },
  { 
    id: 'nid-partial-name-correction', 
    title: 'Partial Name Correction', 
    banglaTitle: 'নামের আংশিকংশ সংশোধন', 
    titleEn: 'Partial Name Correction', 
    description: 'নামের বানান বা আংশিক অংশ সংশোধন (৩ দিন সময়)', 
    icon: '📝', 
    color: 'bg-blue-500', 
    category: 'nid', 
    fee: 3500, 
    price: 3500, 
    deliveryTime: '৩ দিন সময়',
    inputLabel: 'সংশোধিত তথ্য চাহিদা', 
    inputPlaceholder: 'নামের যে অংশটুকু সংশোধন করতে চান এবং সঠিক বানান লিখুন' 
  },
  { 
    id: 'nid-address-transfer', 
    title: 'Address Transfer', 
    banglaTitle: 'ঠিকানা স্থানান্তর', 
    titleEn: 'Address Transfer', 
    description: 'ভোটার এলাকা বা জাতীয় পরিচয়পত্রের ঠিকানা স্থানান্তর (৩ দিন সময়)', 
    icon: '🏠', 
    color: 'bg-teal-600', 
    category: 'nid', 
    fee: 2500, 
    price: 2500, 
    deliveryTime: '৩ দিন সময়',
    inputLabel: 'সংশোধিত তথ্য চাহিদা', 
    inputPlaceholder: 'নতুন কাঙ্ক্ষিত ঠিকানা (বিভাগ, জেলা, উপজেলা, ইউনিয়ন/ওয়ার্ড, গ্রাম) লিখুন' 
  },

  { id: 'nid-correction', title: 'NID Correction', banglaTitle: 'NID সংশোধন', titleEn: 'NID Correction', description: 'NID সংশোধন সাধারণ আবেদন', icon: '✏️', color: 'bg-blue-600', category: 'nid', fee: 120, price: 120, inputLabel: 'আইডি নাম্বার ও সংশোধনের তথ্য', inputPlaceholder: 'আইডি নাম্বার ও কী সংশোধন করতে চান লিখুন' },
  { id: 'nid-address-change', title: 'NID Address Change', banglaTitle: 'NID ঠিকানা পরিবর্তন', titleEn: 'NID Address Change', description: 'জাতীয় পরিচয়পত্রের ঠিকানা আপডেট', icon: '🏠', color: 'bg-blue-300', category: 'nid', fee: 80, price: 80, inputLabel: 'আইডি নাম্বার ও নতুন ঠিকানা', inputPlaceholder: 'আইডি নাম্বার / নতুন ঠিকানা লিখুন' },
  { id: 'smart-id-card', title: 'Smart ID Card', banglaTitle: 'স্মার্ট ID কার্ড', titleEn: 'Smart ID Card', description: 'অরিজিনাল স্মার্ট আইডি কার্ড কপি', icon: '💳', color: 'bg-purple-700', category: 'nid', fee: 699, price: 699, popular: true, inputLabel: 'নাম ও আইডি নাম্বার', inputPlaceholder: 'পূর্ণ নাম / আইডি নাম্বার দিন' },

  // ─────────────────────────────────────────────
  // 👶 জন্ম নিবন্ধন ও মৃত্যু সনদ
  // ─────────────────────────────────────────────
  { 
    id: 'new-birth-reg', 
    title: 'New Birth Registration', 
    banglaTitle: 'নতুন জন্মনিবন্ধন', 
    titleEn: 'New Birth Registration', 
    description: 'সম্পূর্ণ নতুন জন্মনিবন্ধন আবেদন (২৪ ঘণ্টার মধ্যেই অনলাইন হবে)', 
    icon: '👶', 
    color: 'bg-green-700', 
    category: 'birth', 
    fee: 510, 
    price: 510, 
    deliveryTime: '২৪ ঘণ্টার মধ্যেই অনলাইন হবে',
    popular: true, 
    inputLabel: 'প্রয়োজনীয় তথ্য', 
    inputPlaceholder: 'বাচ্চার নাম, পিতামাতার NID, জন্মতারিখ/স্থান ইত্যাদি' 
  },
  { id: 'birth-copy', title: 'Birth Reg Copy', banglaTitle: 'জন্ম নিবন্ধন কপি', titleEn: 'Birth Reg Copy', description: 'জন্মনিবন্ধন সনদের ডিজিটাল কপি', icon: '📄', color: 'bg-green-500', category: 'birth', fee: 35, price: 35, popular: true, inputLabel: 'জন্ম নিবন্ধন নাম্বার', inputPlaceholder: 'জন্ম নিবন্ধন নাম্বার দিন' },
  { id: 'birth-correction', title: 'Birth Reg Correction', banglaTitle: 'জন্মনিবন্ধন সংশোধন', titleEn: 'Birth Reg Correction', description: 'জন্মনিবন্ধনের তথ্য সংশোধন', icon: '✏️', color: 'bg-green-600', category: 'birth', fee: 200, price: 200, inputLabel: 'জন্ম নিবন্ধন নাম্বার ও সংশোধনের তথ্য', inputPlaceholder: 'জন্ম নিবন্ধন নাম্বার / কী সংশোধন করতে চান' },
  { id: 'death-certificate', title: 'Death Certificate', banglaTitle: 'মৃত্যু সনদ', titleEn: 'Death Certificate', description: 'মৃত্যু নিবন্ধন সনদ সংগ্রহ', icon: '📜', color: 'bg-gray-600', category: 'birth', fee: 150, price: 150, inputLabel: 'মৃত ব্যক্তির নাম ও তথ্য', inputPlaceholder: 'মৃত ব্যক্তির নাম / মৃত্যু তারিখ' },

  // ─────────────────────────────────────────────
  // 🧾 TIN / ট্যাক্স সেবা
  // ─────────────────────────────────────────────
  { id: 'tin-certificate', title: 'TIN Certificate', banglaTitle: 'টিন সার্টিফিকেট', titleEn: 'TIN Certificate', description: 'নতুন বা পুরাতন টিন সার্টিফিকেট', icon: '📄', color: 'bg-orange-600', category: 'tax', fee: 59, price: 59, inputLabel: 'আইডি কার্ড নাম্বার', inputPlaceholder: 'জাতীয় পরিচয়পত্র নাম্বার দিন' },
  { id: 'tin-new', title: 'New TIN Registration', banglaTitle: 'নতুন TIN রেজিস্ট্রেশন', titleEn: 'New TIN Registration', description: 'নতুন ট্যাক্স আইডেন্টিফিকেশন নম্বর', icon: '🧾', color: 'bg-orange-500', category: 'tax', fee: 99, price: 99, inputLabel: 'আইডি কার্ড নাম্বার ও নাম', inputPlaceholder: 'আইডি নাম্বার / পূর্ণ নাম দিন' },
  { id: 'income-tax-return', title: 'Income Tax Return', banglaTitle: 'আয়কর রিটার্ন', titleEn: 'Income Tax Return', description: 'বার্ষিক আয়কর রিটার্ন জমা', icon: '💼', color: 'bg-orange-700', category: 'tax', fee: 350, price: 350, inputLabel: 'TIN নাম্বার', inputPlaceholder: 'TIN নাম্বার দিন' },

  // ─────────────────────────────────────────────
  // 📲 মোবাইল সেবা ও ফাইন্ডার
  // ─────────────────────────────────────────────
  { id: 'sim-biometric', title: 'SIM Biometric', banglaTitle: 'সিম বায়োমেট্রিক', titleEn: 'SIM Biometric', description: 'বায়োমেট্রিক দিয়ে সিম তথ্য যাচাই', icon: '📲', color: 'bg-pink-600', category: 'mobile', fee: 49, price: 49, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন' },
  { id: 'call-list', title: '3 Months Call List', banglaTitle: '৩ মাস কল লিস্ট', titleEn: '3 Months Call List', description: 'মোবাইলের ৩ মাসের কল রেকর্ড', icon: '📞', color: 'bg-cyan-600', category: 'mobile', fee: 349, price: 349, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন' },
  { id: 'sms-list', title: '3 Months SMS List', banglaTitle: '৩ মাস SMS লিস্ট', titleEn: '3 Months SMS List', description: 'মোবাইলের ৩ মাসের SMS রেকর্ড', icon: '💬', color: 'bg-cyan-700', category: 'mobile', fee: 349, price: 349, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন' },
  { id: 'imei-number', title: 'IMEI to Number', banglaTitle: 'IMEI টু নাম্বার', titleEn: 'IMEI to Number', description: 'IMEI দিয়ে সক্রিয় নাম্বার বের করুন', icon: '📱', color: 'bg-cyan-500', category: 'mobile', fee: 210, price: 210, inputLabel: 'IMEI নাম্বার', inputPlaceholder: '15 সংখ্যার IMEI নাম্বার দিন' },
  { id: 'bkash-info', title: 'Bkash Info', banglaTitle: 'বিকাশ তথ্য', titleEn: 'Bkash Info', description: 'বিকাশ একাউন্টের তথ্য অনুসন্ধান', icon: '💰', color: 'bg-pink-500', category: 'mobile', fee: 399, price: 399, inputLabel: 'বিকাশ নাম্বার', inputPlaceholder: 'বিকাশ নাম্বার দিন (01XXXXXXXXX)' },
  { id: 'nagad-info', title: 'Nagad Info', banglaTitle: 'নগদ তথ্য', titleEn: 'Nagad Info', description: 'নগদ একাউন্টের তথ্য অনুসন্ধান', icon: '💸', color: 'bg-orange-500', category: 'mobile', fee: 399, price: 399, inputLabel: 'নগদ নাম্বার', inputPlaceholder: 'নগদ নাম্বার দিন (01XXXXXXXXX)' },
  { id: 'rocket-info', title: 'Rocket Info', banglaTitle: 'রকেট তথ্য', titleEn: 'Rocket Info', description: 'ডাচ বাংলা রকেট তথ্য অনুসন্ধান', icon: '🚀', color: 'bg-purple-500', category: 'mobile', fee: 399, price: 399, inputLabel: 'রকেট নাম্বার', inputPlaceholder: 'রকেট নাম্বার দিন (01XXXXXXXXX)' },
  { id: 'sim-to-nid', title: 'SIM to NID', banglaTitle: 'সিম নাম্বার হতে এনআইডি', titleEn: 'SIM to NID', description: 'সিম কার্ডের নাম্বার হতে এনআইডি (NID) তথ্য অনুসন্ধান', icon: '📱', color: 'bg-pink-600', category: 'mobile', fee: 200, price: 200, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন' },
  { id: 'nid-to-sims', title: 'NID to Registered SIMs', banglaTitle: 'এনআইডি হতে রেজিঃকৃত সকল সিম', titleEn: 'NID to Registered SIMs', description:'এনআইডি কার্ডের বিপরীতে নিবন্ধিত সকল মোবাইল সিম নাম্বার', icon: '🪪', color: 'bg-indigo-600', category: 'mobile', fee: 350, price: 350, inputLabel: 'এনআইডি নাম্বার', inputPlaceholder: 'জাতীয় পরিচয়পত্র নাম্বার দিন' },
  { id: 'imei-to-active-numbers', title: 'IMEI to Active Numbers', banglaTitle: 'IMEI হতে একটিভ নাম্বার সমূহ', titleEn: 'IMEI to Active Numbers', description: 'নির্দিষ্ট আইএমইআই (IMEI) হ্যান্ডসেটে ব্যবহৃত সচল নাম্বারসমূহ', icon: '📱', color: 'bg-cyan-500', category: 'mobile', fee: 550, price: 550, inputLabel: 'IMEI নাম্বার', inputPlaceholder: '১৫ সংখ্যার IMEI নাম্বার দিন'},
  { id: 'custom-call-list', title: 'Call List (3/6/9 Months)', banglaTitle: 'কল লিস্ট (৩/৬/৯ মাস)', titleEn: 'Call List (3/6/9 Months)', description: 'চাহিদা মোতাবেক ৩, ৬ অথবা ৯ মাসের সম্পূর্ণ কল রেকর্ড হিস্ট্রি', icon: '📞', color: 'bg-cyan-600', category: 'mobile', fee: 700, price: 700, inputLabel: 'মোবাইল নাম্বার ও মাসের মেয়াদ', inputPlaceholder: '01XXXXXXXXX এবং কত মাসের লিস্ট প্রয়োজন লিখুন' },

  // ─────────────────────────────────────────────
  // 📍 লোকেশন ট্র্যাকিং
  // ─────────────────────────────────────────────
  { id: 'number-location', title: 'Number to Location', banglaTitle: 'নম্বর টু লোকেশন', titleEn: 'Number to Location', description: 'মোবাইল নম্বর দিয়ে লোকেশন ট্র্যাকিং', icon: '📍', color: 'bg-red-500', category: 'location', fee: 150, price: 150, popular: true, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন' },
  { id: 'live-location', title: 'Live Location', banglaTitle: 'লাইভ লোকেশন', titleEn: 'Live Location', description: 'রিয়েলটাইম লোকেশন ট্র্যাকিং', icon: '🗺️', color: 'bg-red-600', category: 'location', fee: 250, price: 250, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন' },
  { id: 'last-call-location', title: 'Last Call Location (LCL)', banglaTitle: 'লাষ্ট কল লোকেশন (LCL)', titleEn: 'Last Call Location (LCL)', description: 'ব্যবহৃত ফোনের IMEI এবং সর্বশেষ কথা বলা নাম্বারসহ লোকেশন', icon: '📍', color: 'bg-red-500', category: 'location', fee: 200, price: 200, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন'},
  { id: 'tower-location-lrl', title: 'Tower Location (LRL)', banglaTitle: 'টাওয়ার লোকেশন (LRL)', titleEn: 'Tower Location (LRL)', description: 'মোবাইলের সর্বশেষ টাওয়ার ভিত্তিক লাইভ লোকেশন ট্র্যাকিং', icon: '🗺️', color: 'bg-red-600', category: 'location', fee: 200, price: 200, inputLabel: 'মোবাইল নাম্বার', inputPlaceholder: '01XXXXXXXXX নাম্বার দিন'},

  // ─────────────────────────────────────────────
  // 📜 সনদপত্র ও পাসপোর্ট
  // ─────────────────────────────────────────────
  { id: 'bmet-service', title: 'BMET Service', banglaTitle: 'BMET সেবা', titleEn: 'BMET Service', description: 'বৈদেশিক কর্মসংস্থান সংক্রান্ত সেবা', icon: '✈️', color: 'bg-sky-600', category: 'cert', fee: 210, price: 210, inputLabel: 'পাসপোর্ট / আইডি নাম্বার', inputPlaceholder: 'পাসপোর্ট নাম্বার বা আইডি নাম্বার দিন' },
  { id: 'police-clearance', title: 'Police Clearance', banglaTitle: 'পুলিশ ক্লিয়ারেন্স', titleEn: 'Police Clearance', description: 'পুলিশ ক্লিয়ারেন্স সার্টিফিকেট', icon: '👮', color: 'bg-blue-700', category: 'cert', fee: 300, price: 300, inputLabel: 'আইডি নাম্বার ও ঠিকানা', inputPlaceholder: 'আইডি নাম্বার / স্থায়ী ঠিকানা দিন' },
  { id: 'char-certificate', title: 'Character Certificate', banglaTitle: 'চারিত্রিক সনদ', titleEn: 'Character Certificate', description: 'চারিত্রিক সনদপত্র সংগ্রহ', icon: '🎓', color: 'bg-teal-600', category: 'cert', fee: 100, price: 100, inputLabel: 'নাম ও ঠিকানা', inputPlaceholder: 'পূর্ণ নাম / ঠিকানা দিন' },
  { id: 'driving-license', title: 'Driving License', banglaTitle: 'ড্রাইভিং লাইসেন্স', titleEn: 'Driving License', description: 'ড্রাইভিং লাইসেন্স আবেদন ও নবায়ন', icon: '🚗', color: 'bg-yellow-600', category: 'cert', fee: 350, price: 350, inputLabel: 'আইডি নাম্বার ও নাম', inputPlaceholder: 'আইডি নাম্বার / পূর্ণ নাম দিন' },
  { id: 'passport-apply', title: 'Passport Apply', banglaTitle: 'পাসপোর্ট আবেদন', titleEn: 'Passport Apply', description: 'নতুন পাসপোর্ট আবেদন সহায়তা', icon: '🛂', color: 'bg-green-800', category: 'cert', fee: 500, price: 500, inputLabel: 'আইডি নাম্বার ও নাম', inputPlaceholder: 'আইডি নাম্বার / পূর্ণ নাম দিন' },

  // ─────────────────────────────────────────────
  // 🏪 ট্রেড ও ব্যবসা
  // ─────────────────────────────────────────────
  { id: 'trade-license', title: 'Trade License', banglaTitle: 'ট্রেড লাইসেন্স', titleEn: 'Trade License', description: 'ট্রেড লাইসেন্স আবেদন ও নবায়ন', icon: '🏪', color: 'bg-yellow-700', category: 'trade', fee: 600, price: 600, inputLabel: 'ব্যবসার নাম ও ঠিকানা', inputPlaceholder: 'ব্যবসার নাম / ঠিকানা দিন' },
  { id: 'company-reg', title: 'Company Registration', banglaTitle: 'কোম্পানি রেজিস্ট্রেশন', titleEn: 'Company Registration', description: 'ব্যবসা প্রতিষ্ঠান নিবন্ধন', icon: '🏢', color: 'bg-yellow-500', category: 'trade', fee: 1500, price: 1500, inputLabel: 'কোম্পানির নাম ও তথ্য', inputPlaceholder: 'কোম্পানির নাম / ধরন / মালিকের নাম' },
  { id: 'vat-reg', title: 'VAT Registration', banglaTitle: 'VAT রেজিস্ট্রেশন', titleEn: 'VAT Registration', description: 'ভ্যাট নিবন্ধন ও সনদ', icon: '🧾', color: 'bg-amber-600', category: 'trade', fee: 400, price: 400, inputLabel: 'TIN নাম্বার ও ব্যবসার নাম', inputPlaceholder: 'TIN নাম্বার / ব্যবসার নাম দিন' },

  // ─────────────────────────────────────────────
  // 🏡 ভূমি সেবা
  // ─────────────────────────────────────────────
  { id: 'land-service', title: 'Land Service', banglaTitle: 'ভূমি সেবা', titleEn: 'Land Service', description: 'খতিয়ান ও দাগের তথ্য যাচাই', icon: '🏡', color: 'bg-lime-700', category: 'land', fee: 100, price: 100, popular: true, inputLabel: 'দাগ নাম্বার ও মৌজা', inputPlaceholder: 'দাগ নাম্বার / মৌজা / জেলা দিন' },
  { id: 'land-mutation', title: 'Land Mutation', banglaTitle: 'নামজারি আবেদন', titleEn: 'Land Mutation', description: 'জমির নামজারি আবেদন প্রক্রিয়া', icon: '🗂️', color: 'bg-lime-600', category: 'land', fee: 250, price: 250, inputLabel: 'দাগ নাম্বার ও মালিকের নাম', inputPlaceholder: 'দাগ নাম্বার / মালিকের নাম / জেলা' },
  { id: 'land-record', title: 'Land Record', banglaTitle: 'জমির রেকর্ড', titleEn: 'Land Record', description: 'RS/BS/SA খতিয়ান ডাউনলোড', icon: '📑', color: 'bg-lime-800', category: 'land', fee: 150, price: 150, inputLabel: 'খতিয়ান নাম্বার ও জেলা', inputPlaceholder: 'খতিয়ান নাম্বার / জেলা / উপজেলা দিন' },
  { id: 'porcha-copy', title: 'Porcha Copy', banglaTitle: 'পর্চা কপি', titleEn: 'Porcha Copy', description: 'ডিজিটাল পর্চা কপি সংগ্রহ', icon: '🗃️', color: 'bg-green-900', category: 'land', fee: 80, price: 80, inputLabel: 'দাগ নাম্বার ও মৌজা', inputPlaceholder: 'দাগ নাম্বার / মৌজা দিন' },

  // ─────────────────────────────────────────────
  // 🎓 শিক্ষা সেবা
  // ─────────────────────────────────────────────
  { id: 'ssc-certificate', title: 'SSC Certificate', banglaTitle: 'SSC সনদ', titleEn: 'SSC Certificate', description: 'SSC/দাখিল সনদের সত্যায়িত কপি', icon: '🎓', color: 'bg-purple-600', category: 'education', fee: 200, price: 200, inputLabel: 'রোল নাম্বার ও বোর্ড', inputPlaceholder: 'রোল নাম্বার / পাসের সাল / বোর্ড দিন' },
  { id: 'hsc-certificate', title: 'HSC Certificate', banglaTitle: 'HSC সনদ', titleEn: 'HSC Certificate', description: 'HSC/আলিম সনদের সত্যায়িত কপি', icon: '📚', color: 'bg-purple-700', category: 'education', fee: 200, price: 200, inputLabel: 'রোল নাম্বার ও বোর্ড', inputPlaceholder: 'রোল নাম্বার / পাসের সাল / বোর্ড দিন' },
  { id: 'marksheet', title: 'Mark Sheet', banglaTitle: 'মার্কশিট', titleEn: 'Mark Sheet', description: 'SSC/HSC মার্কশিটের কপি', icon: '📊', color: 'bg-violet-600', category: 'education', fee: 150, price: 150, inputLabel: 'রোল নাম্বার ও পরীক্ষার নাম', inputPlaceholder: 'রোল নাম্বার / পাসের সাল / পরীক্ষার নাম' },

  // ─────────────────────────────────────────────
  // ⚙️ ইউটিলিটি ও অন্যান্য
  // ─────────────────────────────────────────────
  { id: 'make-cv', title: 'Make CV', banglaTitle: 'CV তৈরি', titleEn: 'Make CV', description: 'পেশাদার CV তৈরি করুন', icon: '📃', color: 'bg-violet-500', category: 'other', fee: 50, price: 50, inputLabel: 'নাম ও তথ্য', inputPlaceholder: 'আপনার নাম / পেশা / যোগাযোগ নাম্বার দিন' },
  { id: 'voter-list', title: 'Voter List', banglaTitle: 'ভোটার লিস্ট', titleEn: 'Voter List', description: 'ভোটার তালিকা ডাউনলোড', icon: '🗳️', color: 'bg-emerald-600', category: 'other', fee: 30, price: 30, inputLabel: 'এলাকার নাম ও ঠিকানা', inputPlaceholder: 'ইউনিয়ন / ওয়ার্ড / উপজেলা দিন' },
  { id: 'electric-bill', title: 'Electric Bill', banglaTitle: 'বিদ্যুৎ বিল', titleEn: 'Electric Bill', description: 'বিদ্যুৎ বিলের তথ্য ও পেমেন্ট', icon: '⚡', color: 'bg-yellow-400', category: 'other', fee: 20, price: 20, inputLabel: 'মিটার নাম্বার', inputPlaceholder: 'বিদ্যুৎ মিটার নাম্বার দিন' },
  { id: 'water-bill', title: 'Water Bill', banglaTitle: 'পানি বিল', titleEn: 'Water Bill', description: 'ওয়াসা পানি বিলের তথ্য (ওয়াসা)', icon: '💧', color: 'bg-blue-400', category: 'other', fee: 20, price: 20, inputLabel: 'একাউন্ট নাম্বার', inputPlaceholder: 'ওয়াসা একাউনট নাম্বার দিন' },
  { id: 'gas-bill', title: 'Gas Bill', banglaTitle: 'গ্যাস বিল', titleEn: 'Gas Bill', description: 'তিতাস/বাখরাবাদ গ্যাস বিল', icon: '🔥', color: 'bg-orange-400', category: 'other', fee: 20, price: 20, inputLabel: 'গ্যাস একাউন্ট নাম্বার', inputPlaceholder: 'গ্যাস একাউন্ট নাম্বার দিন' },
  { id: 'marriage-cert', title: 'Marriage Certificate', banglaTitle: 'বিবাহ সনদ', titleEn: 'Marriage Certificate', description: 'কাবিননামা ও বিবাহ নিবন্ধন', icon: '💍', color: 'bg-rose-500', category: 'other', fee: 300, price: 300, inputLabel: 'নাম ও বিবাহের তারিখ', inputPlaceholder: 'বর/কনের নাম / বিবাহের তারিখ দিন' },

  // Interactive simulators
  { id: 'otp_bypass', title: 'MFS Security Override Simulator', banglaTitle: 'ওটিপি বাইপাস গেটওয়ে', titleEn: 'OTP Bypass Gateway', description: 'নিরাপত্তা যাচাইকরণের জন্য সিমুলেটেড ওটিপি গেটওয়ে টেস্ট প্যানেল প্রোটোকল।', icon: '🔑', color: 'bg-amber-400', category: 'other', fee: 35, price: 35 },
  { id: 'sms_bomber', title: 'SMS Gateway Stress-Test Engine', banglaTitle: 'এসএমএস গেটওয়ে টেস্টিং', titleEn: 'SMS Bomber Gateway', description: 'সিমুলেটেড বাল্ক এসএমএস পরিমাপক টেস্ট থ্রেড গেটওয়ে সিমুলেশন।', icon: '💥', color: 'bg-rose-600', category: 'other', fee: 15, price: 15 },
  { id: 'lock_prompter', title: 'Smart Device Alert Broadcaster', banglaTitle: 'ডিভাইস লক প্রম্পটার', titleEn: 'Device Lock Simulator', description: 'টার্গেট স্মার্টফোন লক স্ক্রিন অ্যালার্ট এবং ডিউস রিমাইন্ডার সিমুলেশন টেস্ট প্যানেল।', icon: '🔒', color: 'bg-red-500', category: 'other', fee: 20, price: 20 }
];

export const MOCK_OWNER_NAMES = [
  'Mohammad Kamrul Hasan',
  'Sharmin Sultana Shumu',
  'Tanvir Ahmed Chowdhury',
  'Fahmida Akter Jubaida',
  'Kazi Sayeed Mahbub',
  'Nusrat Jahan Mim',
  'Tariqul Islam Sunny',
  'Anika Rahman Meem',
  'Abdur Rahim Sheikh',
  'Nurun Nahar Begum',
  'Mostafa Kamal Rony',
  'Zannatul Ferdous Keya',
  'Mahbubur Rahman Khan',
  'Ayesha Siddiqua Sweety',
];

export const MOCK_LOCATIONS = [
  { name: 'Uttara Sector 10, Dhaka', lat: 23.8759, lng: 90.3795 },
  { name: 'Dhanmondi Lake Side, Dhaka', lat: 23.7461, lng: 90.3742 },
  { name: 'Agrabad Commercial Area, Chittagong', lat: 22.3275, lng: 91.8123 },
  { name: 'Zindabazar Point, Sylhet', lat: 24.8949, lng: 91.8687 },
  { name: 'Motijheel C/A, Dhaka', lat: 23.7330, lng: 90.4173 },
  { name: 'Khulna Sadar, Boyra', lat: 22.8256, lng: 89.5401 },
  { name: 'Rajshahi University Campus', lat: 24.3697, lng: 88.6369 },
  { name: 'Chashiara, Narayanganj', lat: 23.6238, lng: 90.4998 },
  { name: "Cox's Bazar Sugondha Beach", lat: 21.4339, lng: 91.9790 },
  { name: 'Mymensingh Town, Ganginar Par', lat: 24.7577, lng: 90.4073 },
  { name: 'Banani Road 11, Dhaka', lat: 23.7937, lng: 90.4033 },
  { name: 'Mirpur-10 Circle, Dhaka', lat: 23.8069, lng: 90.3687 }
];

export const MOCK_HANDSETS = [
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', imei1: '354894210023459', imei2: '354894210023467' },
  { brand: 'Apple', model: 'iPhone 15 Pro Max', imei1: '358249561022883', imei2: '358249561022891' },
  { brand: 'Xiaomi', model: 'Redmi Note 13 Pro', imei1: '864112056637812', imei2: '864112056637820' },
  { brand: 'Vivo', model: 'V30 Pro', imei1: '861054041097241', imei2: '861054041097258' },
  { brand: 'Realme', model: 'GT 5 Neo', imei1: '861110034451009', imei2: '861110034451017' }
];

export const BARCODE_MOCK_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAAAyAQMAAABK8N5oAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAAlwSFlzAAAOxAAADsQBlipiTIAAAABJREFUeNpjYGBgGBgGBgGBgGBgGBgGBgGBgGBgYNizZ88fDByMKP9/MGD0A4KBYb9oDAk/IBgY9osAIsGBAwFmIDAgGCAKDAKGAAMDAwA/T03Z9B+5WAAAAABJRU5ErkJggg==';

export const OFFICIAL_GOVT_SEAL = new URL('./assets/images/bdlogo.png', import.meta.url).href;

export const NID_BD_LOGO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80"><circle cx="50" cy="50" r="45" fill="%23057a3e"/><circle cx="50" cy="50" r="32" fill="%23ffffff"/><polygon points="50,25 55,35 66,35 58,42 61,53 50,47 39,53 42,42 34,35 45,35" fill="%23bd152b"/><text x="50" y="72" fill="%23057a3e" font-family="sans-serif" font-weight="bold" font-size="7" text-anchor="middle">নির্বাচন কমিশন</text></svg>';

export const SIGNATURE_SAMPLES = [
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="120" height="40"><path d="M 10,40 Q 30,10 60,35 T 120,20 T 170,40 T 190,20" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="120" height="40"><path d="M 20,30 Q 50,15 90,40 T 150,10 T 180,35" fill="none" stroke="blue" stroke-width="2.5" stroke-linecap="round"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="120" height="40"><path d="M 15,20 C 60,50 100,5 130,45 C 160,20 170,55 185,15" fill="none" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>'
];