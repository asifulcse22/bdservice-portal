// src/components/ServiceViews.tsx
import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Upload, Clock, FileText, Sparkles, ShieldCheck, Building2 } from 'lucide-react';
import { SYSTEM_SERVICES } from '../data';
import { ServiceType, ServiceDefinition } from '../types';

interface ServiceViewsProps {
  activeServiceId: ServiceType;
  walletBalance: number;
  deductFee: (amount: number, service: any) => boolean | Promise<boolean>;
  onBack: () => void;
  triggerToast: (title: string, message: string) => void;
  openWallet?: () => void;
  onOrderPlaced?: (order: any) => void;
}

interface OfficialFieldConfig {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'tel' | 'date' | 'select' | 'textarea' | 'file';
  options?: string[];
  required?: boolean;
  halfWidth?: boolean;
}

interface OfficialFormSchema {
  department: string;
  formCode: string;
  notice?: string;
  deliveryTime?: string;
  fields: OfficialFieldConfig[];
}

// প্রতিটি সার্ভিসের জন্য সরকারি অফিশিয়াল ফরম্যাট ও প্রয়োজনীয় ফিল্ড কনফিগারেশন
function getOfficialFormSchema(service: ServiceDefinition): OfficialFormSchema {
  const id = service.id;

  // ১. সার্ভার কপি / অফিসিয়াল সার্ভার কপি / NID PDF
  if (id === 'server-copy' || id === 'official-server-copy' || id === 'nid-pdf') {
    return {
      department: 'বাংলাদেশ নির্বাচন কমিশন • NID Wing',
      formCode: 'EC-NID-VERIFICATION',
      notice: 'জাতীয় পরিচয়পত্রের ১০, ১৩ অথবা ১৭ ডিজিটের নম্বর এবং সঠিক জন্ম তারিখ প্রদান করুন।',
      deliveryTime: service.deliveryTime || 'তাৎক্ষণিক / ৫-১০ মিনিট',
      fields: [
        { id: 'nidNo', label: 'জাতীয় পরিচয়পত্র (NID) নম্বর (১০/১৩/১৭ ডিজিট)', placeholder: 'উদাহরণ: 19952692014002341 বা 3754218960', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (Date of Birth)', placeholder: 'DD/MM/YYYY (যেমন: 15/08/1996)', type: 'text', required: true },
        { id: 'voterName', label: 'ভোটারের নাম (ঐচ্ছিক - ভেরিফিকেশনের জন্য)', placeholder: 'ভোটারের নাম লিখুন (যদি জানা থাকে)', type: 'text', required: false },
      ]
    };
  }

  // ২. সাইন কপি
  if (id === 'sign-copy') {
    return {
      department: 'জাতীয় পরিচয় নিবন্ধন অনুবিভাগ • Election Commission',
      formCode: 'NID-SIGN-COPY',
      notice: 'সাইন কপি সংগ্রহের জন্য সঠিক এনআইডি/ভোটার নম্বর ও জন্ম তারিখ দিন।',
      deliveryTime: '১০-৩০ মিনিট',
      fields: [
        { id: 'nidOrVoterNo', label: 'NID নম্বর অথবা ভোটার নম্বর', placeholder: '১০/১৩/১৭ ডিজিটের NID বা ভোটার নম্বর দিন', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY (যেমন: 01/01/1995)', type: 'text', required: true },
        { id: 'fullName', label: 'ভোটারের নাম (ঐচ্ছিক)', placeholder: 'নাম লিখুন', type: 'text', required: false },
      ]
    };
  }

  // ৩. ফরম নং -> সাইন কপি
  if (id === 'form-sign-copy') {
    return {
      department: 'বাংলাদেশ নির্বাচন কমিশন • Slip to Sign Copy',
      formCode: 'FORM-2-SIGN',
      notice: 'নতুন ভোটার নিবন্ধনের ৮ বা ১০ সংখ্যার ফরম/স্লিপ নম্বর এবং জন্ম তারিখ প্রদান করুন।',
      deliveryTime: '১০-৩০ মিনিট',
      fields: [
        { id: 'formNo', label: 'ভোটার নিবন্ধন ফরম / স্লিপ নম্বর', placeholder: 'ফরম বা স্লিপ নম্বর লিখুন (যেমন: 12045896)', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY (যেমন: 12/05/2003)', type: 'text', required: true },
        { id: 'applicantName', label: 'আবেদনকারীর নাম (ঐচ্ছিক)', placeholder: 'নিবন্ধনকারীর নাম', type: 'text', required: false },
      ]
    };
  }

  // ৪. ভোটার নাম্বার দিয়ে এনআইডি সার্ভিস
  if (id === 'nid-voter-number') {
    return {
      department: 'বাংলাদেশ নির্বাচন কমিশন • Voter Registry',
      formCode: 'VOTER-NO-LOOKUP',
      notice: '১২ ডিজিটের ভোটার নম্বর এবং ভোটার এলাকার তথ্য প্রদান করুন।',
      deliveryTime: '১০-৩০ মিনিট',
      fields: [
        { id: 'voterNo', label: 'ভোটার নম্বর (Voter Number)', placeholder: '১২ সংখ্যার ভোটার নম্বর লিখুন', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY', type: 'text', required: true },
        { id: 'voterArea', label: 'ভোটার এলাকা (ইউনিয়ন/ওয়ার্ড, উপজেলা ও জেলা)', placeholder: 'গ্রাম/ওয়ার্ড, উপজেলা, জেলা লিখুন', type: 'text', required: true },
      ]
    };
  }

  // ৫. স্মার্ট আইডি কার্ড
  if (id === 'smart-id-card') {
    return {
      department: 'জাতীয় পরিচয় নিবন্ধন অনুবিভাগ • Smart Card Wing',
      formCode: 'SMART-NID-ORDER',
      notice: 'স্মার্ট আইডি কার্ড প্রিন্ট/PDF কপির জন্য এনআইডি নম্বর ও জন্ম তারিখ সঠিকভাবে পূরণ করুন।',
      deliveryTime: '১-৩ ঘণ্টা',
      fields: [
        { id: 'nidNo', label: 'স্মার্ট NID / জাতীয় পরিচয়পত্র নম্বর', placeholder: '১০ বা ১৭ ডিজিটের NID নম্বর দিন', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY', type: 'text', required: true, halfWidth: true },
        { id: 'nameBangla', label: 'পূর্ণ নাম (বাংলা ও ইংরেজিতে)', placeholder: '', type: 'text', required: true },
        { id: 'parentsName', label: 'পিতা ও মাতার নাম', placeholder: 'পিতার নাম / মাতার নাম', type: 'text', required: true },
        { id: 'bloodGroup', label: 'রক্তের গ্রুপ (Blood Group)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'জানা নেই'], required: true, halfWidth: true },
        { id: 'birthPlace', label: 'জন্মস্থান (জেলা)', placeholder: 'যেমন: DHAKA / ঢাকা', type: 'text', required: true, halfWidth: true },
        { id: 'address', label: 'স্থায়ী ঠিকানা (কার্ডের পেছনের অংশের জন্য)', placeholder: 'বাসা/হোল্ডিং, গ্রাম/রাস্তা, ডাকঘর, উপজেলা, জেলা', type: 'textarea', required: true },
      ]
    };
  }

  // ৫.৫ নতুন ভোটার আবেদন (ফরম-২) ও নতুন আইডি কার্ড নিবন্ধন
  if (
    id === 'new-voter' ||
    id === 'new-voter-registration' ||
    id === 'new-nid-card' ||
    id === 'new-nid' ||
    service.banglaTitle?.includes('নতুন ভোটার') ||
    service.banglaTitle?.includes('নতুন আইডি')
  ) {
    return {
      department: 'বাংলাদেশ নির্বাচন কমিশন • ভোটার নিবন্ধন শাখা (ফরম-২)',
      formCode: 'EC-FORM-2-NEW-VOTER',
      notice: 'নির্বাচন কমিশনের অফিশিয়াল ফরম-২ অনুযায়ী ১৭ ডিজিটের অনলাইন জন্ম সনদ ও পিতা-মাতার এনআইডি তথ্যের সাথে হুবহু মিল রেখে ফরমটি পূরণ করুন।',
      deliveryTime: service.deliveryTime || '২৪-৭২ ঘণ্টা (অনলাইন ফরম-২ ও নিবন্ধন স্লিপ)',
      fields: [
        { id: 'nameBangla', label: '১. আবেদনকারীর নাম (বাংলায় - জন্ম সনদ অনুযায়ী)', placeholder: '', type: 'text', required: true, halfWidth: true },
        { id: 'nameEnglish', label: '২. আবেদনকারীর নাম (ইংরেজিতে - CAPITAL LETTER)', placeholder: '', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: '৩. জন্ম তারিখ (Date of Birth - সনদ অনুযায়ী)', placeholder: 'DD/MM/YYYY (যেমন: 15/05/2004)', type: 'text', required: true, halfWidth: true },
        { id: 'brnNo', label: '৪. ১৭ সংখ্যার অনলাইন জন্ম নিবন্ধন নম্বর (BRN)', placeholder: '17-Digit Birth Registration No', type: 'text', required: true, halfWidth: true },
        { id: 'gender', label: '৫. লিঙ্গ (Gender)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['পুরুষ (Male)', 'মহিলা (Female)', 'তৃতীয় লিঙ্গ (Third Gender)'], required: true, halfWidth: true },
        { id: 'bloodGroup', label: '৬. রক্তের গ্রুপ (Blood Group)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'জানা নেই (Unknown)'], required: true, halfWidth: true },
        { id: 'birthDistrict', label: '৭. জন্মস্থান (জেলা ও দেশ)', placeholder: 'যেমন: ঢাকা, বাংলাদেশ', type: 'text', required: true, halfWidth: true },
        { id: 'religion', label: '৮. ধর্ম (Religion)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['ইসলাম (Islam)', 'হিন্দু (Hinduism)', 'বৌদ্ধ (Buddhism)', 'খ্রিস্টান (Christianity)', 'অন্যান্য'], required: true, halfWidth: true },
        { id: 'fatherName', label: '৯. পিতার নাম (বাংলা ও ইংরেজিতে - NID অনুযায়ী)', placeholder: 'পিতার নাম বাংলায় ও ইংরেজিতে লিখুন', type: 'text', required: true, halfWidth: true },
        { id: 'fatherNid', label: '১০. পিতার জাতীয় পরিচয়পত্র (NID) নম্বর', placeholder: '১০/১৩/১৭ ডিজিটের NID (মৃত হলে "মৃত - সন" লিখুন)', type: 'text', required: true, halfWidth: true },
        { id: 'motherName', label: '১১. মাতার নাম (বাংলা ও ইংরেজিতে - NID অনুযায়ী)', placeholder: 'মাতার নাম বাংলায় ও ইংরেজিতে লিখুন', type: 'text', required: true, halfWidth: true },
        { id: 'motherNid', label: '১২. মাতার জাতীয় পরিচয়পত্র (NID) নম্বর', placeholder: '১০/১৩/১৭ ডিজিটের NID (মৃত হলে "মৃত - সন" লিখুন)', type: 'text', required: true, halfWidth: true },
        { id: 'maritalStatus', label: '১৩. বৈবাহিক অবস্থা (Marital Status)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['অবিবাহিত (Unmarried)', 'বিবাহিত (Married)', 'তালাকপ্রাপ্ত (Divorced)', 'বিধবা / বিপত্নীক'], required: true, halfWidth: true },
        { id: 'spouseInfo', label: '১৪. স্বামী/স্ত্রীর নাম ও NID নম্বর (বিবাহিত হলে)', placeholder: 'বিবাহিত হলে স্বামী/স্ত্রীর নাম ও NID লিখুন', type: 'text', required: false, halfWidth: true },
        { id: 'education', label: '১৫. শিক্ষাগত যোগ্যতা (Educational Qualification)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['পঞ্চম শ্রেণি / পিইসি', 'অষ্টম শ্রেণি / জেএসসি', 'এসএসসি / দাখিল / সমমান', 'এইচএসসি / আলিম / সমমান', 'স্নাতক / অনার্স / সমমান', 'স্নাতকোত্তর / মাস্টার্স', 'অন্যান্য / স্বাক্ষরজ্ঞান সম্পন্ন'], required: true, halfWidth: true },
        { id: 'occupation', label: '১৬. পেশা (Occupation)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['ছাত্র / ছাত্রী (Student)', 'বেসরকারি চাকরি (Private Service)', 'সরকারি চাকরি (Govt. Service)', 'ব্যবসা (Business)', 'গৃহিণী (Housewife)', 'কৃষি (Agriculture)', 'প্রবাসী (Expatriate)', 'বেকার / অন্যান্য'], required: true, halfWidth: true },
        { id: 'voterMobile', label: '১৭. আবেদনকারীর সচল মোবাইল নম্বর (OTP ও মেসেজের জন্য)', placeholder: '01XXXXXXXXX (নিজের বা পরিবারের সচল নম্বর)', type: 'tel', required: true },
        { id: 'presentAddress', label: '১৮. বর্তমান ঠিকানা / ভোটার এলাকা (বিভাগ, জেলা, উপজেলা/থানা, ইউনিয়ন/ওয়ার্ড নং, গ্রাম/মহল্লা, বাসা/হোল্ডিং ও পোস্ট কোড)', placeholder: 'বাসা/হোল্ডিং নং, গ্রাম/রাস্তা, ওয়ার্ড নং, ইউনিয়ন/পৌরসভা, ডাকঘর ও পোস্ট কোড, উপজেলা/থানা, জেলা', type: 'textarea', required: true },
        { id: 'permanentAddress', label: '১৯. স্থায়ী ঠিকানা (বর্তমান ঠিকানার একই হলে "একই" লিখুন অথবা পূর্ণ ঠিকানা লিখুন)', placeholder: 'স্থায়ী ঠিকানার গ্রাম/মহল্লা, ওয়ার্ড, ইউনিয়ন, ডাকঘর, উপজেলা ও জেলা', type: 'textarea', required: true },
        { id: 'birthCertFile', label: '২০. ডিজিটাল জন্ম নিবন্ধন সনদ (১৭ ডিজিট অনলাইন কপি)', placeholder: 'অনলাইন জন্ম নিবন্ধন সনদের স্পষ্ট ছবি বা PDF আপলোড করুন', type: 'file', required: true, halfWidth: true },
        { id: 'parentsNidFile', label: '২১. পিতা ও মাতার NID কার্ডের কপি', placeholder: 'পিতা ও মাতার আইডি কার্ডের ছবি বা PDF আপলোড করুন', type: 'file', required: true, halfWidth: true },
        { id: 'educationCertFile', label: '২২. শিক্ষাগত সনদ (SSC/JSC/PEC - যদি থাকে)', placeholder: 'সার্টিফিকেট বা রেজিস্ট্রেশন কার্ডের কপি আপলোড করুন (ঐচ্ছিক)', type: 'file', required: false, halfWidth: true },
        { id: 'addressProofFile', label: '২৩. নাগরিকত্ব সনদ ও বিদ্যুৎ বিল / হোল্ডিং ট্যাক্স রসিদ', placeholder: 'চেয়ারম্যান/কাউন্সিলর সনদ বা বিদ্যুৎ বিলের কপি আপলোড করুন', type: 'file', required: true, halfWidth: true },
        { id: 'photoSignFile', label: '২৪. আবেদনকারীর পাসপোর্ট সাইজ ছবি ও স্বাক্ষর (ঐচ্ছিক)', placeholder: 'পাসপোর্ট সাইজ ছবি বা স্বাক্ষরের ছবি আপলোড করুন', type: 'file', required: false },
      ]
    };
  }

  // ৬. আইডি কার্ড সংশোধন ও ঠিকানা পরিবর্তন (সকল সংশোধন সেবা)
  if (
    (id.includes('correction') && id.startsWith('nid')) ||
    id === 'nid-address-transfer' ||
    id === 'nid-address-change'
  ) {
    return {
      department: 'নির্বাচন কমিশন বাংলাদেশ • NID Amendment Desk',
      formCode: 'NID-FORM-2-AMEND',
      notice: 'জাতীয় পরিচয়পত্র সংশোধন বা ঠিকানা পরিবর্তনের জন্য বর্তমান তথ্য, কাঙ্ক্ষিত সঠিক তথ্য এবং প্রমাণপত্র সংযুক্ত করুন।',
      deliveryTime: service.deliveryTime || '৩ দিন সময়',
      fields: [
        { id: 'nidNo', label: 'বর্তমান NID নম্বর (১০/১৩/১৭ ডিজিট)', placeholder: 'বর্তমান এনআইডি নম্বর লিখুন', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: 'বর্তমান জন্ম তারিখ (NID অনুযায়ী)', placeholder: 'DD/MM/YYYY', type: 'text', required: true, halfWidth: true },
        { id: 'currentWrongInfo', label: 'বর্তমান কার্ডে থাকা তথ্য (যা পরিবর্তন করতে চান)', placeholder: 'বর্তমানে কার্ডে ভুল যে নাম/বয়স/ঠিকানা লেখা আছে তা লিখুন', type: 'text', required: true },
        { id: 'correctedInfo', label: 'সংশোধিত সঠিক তথ্য চাহিদা (বিস্তারিত)', placeholder: 'সংশোধনের পর সঠিক যে নাম/জন্মতারিখ/ঠিকানা হবে তা স্পষ্টভাবে লিখুন...', type: 'textarea', required: true },
        { id: 'guardianPhone', label: 'আবেদনকারীর সচল মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
        { id: 'nidFile', label: 'বর্তমান আইডি কার্ডের ছবি / PDF জমা দিন', placeholder: 'আইডি কার্ডের স্পষ্ট ছবি বা PDF নির্বাচন করুন', type: 'file', required: true },
        { id: 'supportDocFile', label: 'জন্ম নিবন্ধন / সনদ / প্রমাণের ছবি জমা দিন', placeholder: 'ডিজিটাল জন্ম সনদ বা একাডেমিক সনদের কপি নির্বাচন করুন', type: 'file', required: true },
      ]
    };
  }

  // ৭. নতুন জন্ম নিবন্ধন (BDRIS Form-1)
  if (id === 'new-birth-reg' || id.includes('new-birth')) {
    return {
      department: 'রেজিস্ট্রার জেনারেলের কার্যালয় • জন্ম ও মৃত্যু নিবন্ধন (BDRIS)',
      formCode: 'BDRIS-NEW-REG',
      notice: 'সরকারি BDRIS সার্ভারের নিয়ম অনুযায়ী বাংলা ও ইংরেজি (Capital Letter) উভয় ভাষায় সঠিক তথ্য প্রদান করুন।',
      deliveryTime: '২৪ ঘণ্টার মধ্যেই অনলাইন হবে',
      fields: [
        { id: 'childNameBn', label: 'নিবন্ধনাধীন ব্যক্তির নাম (বাংলায়)', placeholder: 'যেমন: মোঃ তানভীর আহমেদ', type: 'text', required: true, halfWidth: true },
        { id: 'childNameEn', label: 'Name in English (Capital Letter)', placeholder: 'e.g. MD TANVIR AHMED', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: 'জন্ম তারিখ ও সময় (Date of Birth)', placeholder: 'DD/MM/YYYY (যেমন: 10/03/2020)', type: 'text', required: true, halfWidth: true },
        { id: 'gender', label: 'লিঙ্গ (Gender) ও সন্তান ক্রম', placeholder: 'নির্বাচন করুন', type: 'select', options: ['পুরুষ (Male) - ১ম সন্তান', 'মহিলা (Female) - ১ম সন্তান', 'পুরুষ (Male) - ২য় সন্তান', 'মহিলা (Female) - ২য় সন্তান', 'পুরুষ (Male) - অন্যান্য', 'মহিলা (Female) - অন্যান্য'], required: true, halfWidth: true },
        { id: 'fatherName', label: 'পিতার নাম (বাংলা ও ইংরেজি)', placeholder: 'পিতার নাম বাংলায় ও ইংরেজিতে লিখুন', type: 'text', required: true },
        { id: 'fatherNidBrn', label: 'পিতার NID নম্বর ও ১৭ ডিজিটের জন্ম নিবন্ধন নম্বর', placeholder: 'পিতার NID নম্বর / জন্ম নিবন্ধন নম্বর', type: 'text', required: true },
        { id: 'motherName', label: 'মাতার নাম (বাংলা ও ইংরেজি)', placeholder: 'মাতার নাম বাংলায় ও ইংরেজিতে লিখুন', type: 'text', required: true },
        { id: 'motherNidBrn', label: 'মাতার NID নম্বর ও ১৭ ডিজিটের জন্ম নিবন্ধন নম্বর', placeholder: 'মাতার NID নম্বর / জন্ম নিবন্ধন নম্বর', type: 'text', required: true },
        { id: 'permanentAddress', label: 'জন্মস্থান ও স্থায়ী ঠিকানা (গ্রাম/রোড, ডাকঘর, ইউনিয়ন/ওয়ার্ড, উপজেলা, জেলা)', placeholder: 'পূর্ণ ঠিকানা বাংলা ও ইংরেজিতে লিখুন', type: 'textarea', required: true },
        { id: 'guardianPhone', label: 'অভিভাবকের সচল মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
      ]
    };
  }

  // ৮. জন্ম নিবন্ধন ডিজিটাল কপি
  if (id === 'birth-copy') {
    return {
      department: 'রেজিস্ট্রার জেনারেলের কার্যালয় • BDRIS Verification',
      formCode: 'BDRIS-CERT-COPY',
      notice: '১৭ সংখ্যার জন্ম নিবন্ধন নম্বর এবং জন্ম তারিখ সঠিকভাবে প্রদান করুন।',
      deliveryTime: '১০-২০ মিনিট',
      fields: [
        { id: 'brnNo', label: '১৭ সংখ্যার জন্ম নিবন্ধন নম্বর (17-Digit BRN)', placeholder: '১৭ ডিজিটের জন্ম নিবন্ধন নম্বর দিন (যেমন: 20012692014002341)', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY বা YYYY-MM-DD)', placeholder: 'DD/MM/YYYY (যেমন: 14/06/2001)', type: 'text', required: true },
        { id: 'personName', label: 'নিবন্ধিত ব্যক্তির নাম (ঐচ্ছিক)', placeholder: 'নাম লিখুন', type: 'text', required: false },
      ]
    };
  }

  // ৯. জন্ম নিবন্ধন সংশোধন
  if (id === 'birth-correction') {
    return {
      department: 'জন্ম ও মৃত্যু নিবন্ধন অনুবিভাগ • BDRIS Correction',
      formCode: 'BDRIS-AMEND-FORM',
      notice: '১৭ ডিজিটের জন্ম নিবন্ধন নম্বর এবং যেসব তথ্য সংশোধন করতে চান তা সুস্পষ্টভাবে উল্লেখ করুন।',
      deliveryTime: '২৪-৪৮ ঘণ্টা',
      fields: [
        { id: 'brnNo', label: '১৭ সংখ্যার জন্ম নিবন্ধন নম্বর (BRN)', placeholder: '১৭ ডিজিটের জন্ম নিবন্ধন নম্বর দিন', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: 'বর্তমান জন্ম তারিখ (সনদ অনুযায়ী)', placeholder: 'DD/MM/YYYY', type: 'text', required: true, halfWidth: true },
        { id: 'wrongInfo', label: 'বর্তমান সনদে থাকা ভুল তথ্য', placeholder: 'বর্তমানে ভুল কী লেখা আছে তা লিখুন', type: 'text', required: true },
        { id: 'correctInfo', label: 'কাঙ্ক্ষিত সঠিক তথ্য (বাংলা ও ইংরেজি)', placeholder: 'সংশোধনের পর সঠিক কী তথ্য বসবে তা বিস্তারিত লিখুন...', type: 'textarea', required: true },
        { id: 'guardianPhone', label: 'আবেদনকারীর মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
        { id: 'docFile', label: 'জন্ম সনদ / পিতা-মাতার NID কপি আপলোড (ঐচ্ছিক)', placeholder: 'প্রমাণপত্রের ছবি বা PDF নির্বাচন করুন', type: 'file', required: false },
      ]
    };
  }

  // ১০. মৃত্যু নিবন্ধন সনদ
  if (id === 'death-certificate') {
    return {
      department: 'স্থানীয় সরকার বিভাগ • Death Registration (BDRIS)',
      formCode: 'BDRIS-DEATH-CERT',
      notice: 'মৃত ব্যক্তির সঠিক তথ্য ও মৃত্যুর তারিখ প্রদান করুন।',
      deliveryTime: '১২-২৪ ঘণ্টা',
      fields: [
        { id: 'deceasedName', label: 'মৃত ব্যক্তির নাম (বাংলা ও ইংরেজি)', placeholder: 'মৃত ব্যক্তির পূর্ণ নাম লিখুন', type: 'text', required: true },
        { id: 'nidOrBrn', label: 'মৃত ব্যক্তির জন্ম নিবন্ধন (১৭ ডিজিট) / NID নম্বর', placeholder: 'জন্ম নিবন্ধন বা এনআইডি নম্বর দিন', type: 'text', required: true },
        { id: 'parentsSpouse', label: 'পিতা, মাতা ও স্বামী/স্ত্রীর নাম', placeholder: 'পিতার নাম, মাতার নাম ও স্বামী/স্ত্রীর নাম', type: 'text', required: true },
        { id: 'deathDate', label: 'মৃত্যুর তারিখ ও সময়', placeholder: 'DD/MM/YYYY', type: 'text', required: true, halfWidth: true },
        { id: 'deathCause', label: 'মৃত্যুর কারণ', placeholder: 'যেমন: বার্ধক্যজনিত / হৃদযন্ত্রের ক্রিয়া বন্ধ', type: 'text', required: true, halfWidth: true },
        { id: 'deathAddress', label: 'মৃত্যুস্থান ও স্থায়ী ঠিকানা', placeholder: 'গ্রাম/মহল্লা, ইউনিয়ন/ওয়ার্ড, উপজেলা, জেলা', type: 'textarea', required: true },
      ]
    };
  }

  // ১১. টিন সার্টিফিকেট কপি
  if (id === 'tin-certificate') {
    return {
      department: 'জাতীয় রাজস্ব বোর্ড (NBR) • e-TIN Wing',
      formCode: 'NBR-ETIN-COPY',
      notice: 'পুরাতন বা বিদ্যমান ই-টিন সার্টিফিকেট ডাউনলোডের জন্য TIN অথবা NID নম্বর দিন।',
      deliveryTime: '১০-২০ মিনিট',
      fields: [
        { id: 'tinOrNid', label: '১২ ডিজিটের TIN নম্বর অথবা NID নম্বর', placeholder: 'TIN নম্বর বা জাতীয় পরিচয়পত্র নম্বর লিখুন', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY (NID অনুযায়ী)', type: 'text', required: true, halfWidth: true },
        { id: 'phone', label: 'নিবন্ধিত মোবাইল নম্বর (যদি থাকে)', placeholder: '01XXXXXXXXX', type: 'tel', required: false, halfWidth: true },
      ]
    };
  }

  // ১২. নতুন TIN রেজিস্ট্রেশন
  if (id === 'tin-new') {
    return {
      department: 'জাতীয় রাজস্ব বোর্ড (NBR) • New Taxpayer Registration',
      formCode: 'NBR-NEW-ETIN',
      notice: 'জাতীয় পরিচয়পত্রের তথ্যের সাথে মিল রেখে নতুন ১২ ডিজিটের ই-টিন নিবন্ধনের তথ্য দিন।',
      deliveryTime: '১০-৩০ মিনিট',
      fields: [
        { id: 'nidNo', label: 'জাতীয় পরিচয়পত্র (NID) নম্বর', placeholder: '১০/১৩/১৭ ডিজিটের NID নম্বর', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: 'জন্ম তারিখ (NID অনুযায়ী)', placeholder: 'DD/MM/YYYY', type: 'text', required: true, halfWidth: true },
        { id: 'fullName', label: 'করদাতার পূর্ণ নাম (ইংরেজি ও বাংলায়)', placeholder: 'NID অনুযায়ী পূর্ণ নাম লিখুন', type: 'text', required: true },
        { id: 'incomeSource', label: 'আয়ের প্রধান উৎস / নিবন্ধনের উদ্দেশ্য', placeholder: 'নির্বাচন করুন', type: 'select', options: ['চাকরি / বেতনভোগী (Service)', 'ব্যবসা / ট্রেড লাইসেন্স (Business)', 'জমি ক্রয়/বিক্রয় নিবন্ধন', 'ব্যাংক লোন / ক্রেডিট কার্ড', 'পেশাজীবী / ফ্রিল্যান্সিং', 'অন্যান্য (Others)'], required: true, halfWidth: true },
        { id: 'mobile', label: 'সচল মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true, halfWidth: true },
        { id: 'address', label: 'বর্তমান ও স্থায়ী ঠিকানা (থানা ও পোস্ট কোডসহ)', placeholder: 'গ্রাম/বাসা, ডাকঘর, থানা/উপজেলা, জেলা', type: 'textarea', required: true },
      ]
    };
  }

  // ১৩. আয়কর রিটার্ন (Zero Tax / e-Return)
  if (id === 'income-tax-return') {
    return {
      department: 'জাতীয় রাজস্ব বোর্ড (NBR) • e-Return Assessment',
      formCode: 'NBR-IT-RETURN',
      notice: 'বার্ষিক আয়কর রিটার্ন (জিরো রিটার্ন / সাধারণ রিটার্ন) দাখিল ও প্রাপ্তিস্বীকার সনদ (Acknowledgement Slip) সংগ্রহের তথ্য দিন।',
      deliveryTime: '১-৩ ঘণ্টা',
      fields: [
        { id: 'tinNo', label: '১২ সংখ্যার ই-টিন (e-TIN) নম্বর', placeholder: '১২ ডিজিটের ই-টিন নম্বর লিখুন', type: 'text', required: true, halfWidth: true },
        { id: 'nidNo', label: 'জাতীয় পরিচয়পত্র (NID) নম্বর', placeholder: '১০/১৩/১৭ ডিজিটের NID নম্বর', type: 'text', required: true, halfWidth: true },
        { id: 'taxpayerName', label: 'করদাতার নাম ও জন্ম তারিখ', placeholder: 'পূর্ণ নাম ও জন্ম তারিখ (DD/MM/YYYY)', type: 'text', required: true },
        { id: 'returnType', label: 'রিটার্নের ধরন ও কর বর্ষ', placeholder: 'নির্বাচন করুন', type: 'select', options: ['জিরো রিটার্ন (Zero Tax Return) - ২০২৫-২০২৬', 'সাধারণ রিটার্ন (Normal Return) - ২০২৫-২০২৬', 'জিরো রিটার্ন (Zero Tax Return) - ২০২৪-২০২৫'], required: true, halfWidth: true },
        { id: 'mobile', label: 'ই-রিটার্ন নিবন্ধিত মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true, halfWidth: true },
      ]
    };
  }

  // ১৪. সিম বায়োমেট্রিক ও সিম হতে এনআইডি
  if (id === 'sim-biometric' || id === 'sim-to-nid') {
    return {
      department: 'টেলিযোগাযোগ নিয়ন্ত্রণ ডাটাবেস • BTRC Biometric Hub',
      formCode: 'SIM-BIO-VERIFY',
      notice: 'যে সিম নম্বরটির নিবন্ধিত এনআইডি ও মালিকানা তথ্য যাচাই করতে চান সেই ১১ ডিজিটের নম্বরটি দিন।',
      deliveryTime: '১০-৩০ মিনিট',
      fields: [
        { id: 'phoneNo', label: 'সচল মোবাইল নম্বর (১১ ডিজিট)', placeholder: '01XXXXXXXXX (যেমন: 01712345678)', type: 'tel', required: true },
        { id: 'operator', label: 'সিম অপারেটর নির্বাচন করুন', placeholder: 'অপারেটর বাছাই করুন', type: 'select', options: ['Grameenphone (017 / 013)', 'Robi (018)', 'Banglalink (019 / 014)', 'Airtel (016)', 'Teletalk (015)'], required: true },
      ]
    };
  }

  // ১৫. এনআইডি হতে নিবন্ধিত সকল সিম
  if (id === 'nid-to-sims') {
    return {
      department: 'BTRC Central Biometric Verification System',
      formCode: 'NID-ALL-SIM-LIST',
      notice: 'একটি এনআইডি কার্ডের বিপরীতে কোন কোন অপারেটরের কয়টি সিম নিবন্ধিত আছে তা জানতে NID ও জন্ম তারিখ দিন।',
      deliveryTime: '১০-৩০ মিনিট',
      fields: [
        { id: 'nidNo', label: 'জাতীয় পরিচয়পত্র (NID) নম্বর (১০/১৩/১৭ ডিজিট)', placeholder: 'এনআইডি নম্বর লিখুন', type: 'text', required: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY', type: 'text', required: true },
        { id: 'samplePhone', label: 'উক্ত NID-তে নিবন্ধিত যেকোনো ১টি সিম নম্বর (যদি জানা থাকে)', placeholder: '01XXXXXXXXX (ঐচ্ছিক)', type: 'tel', required: false },
      ]
    };
  }

  // ১৬. কল লিস্ট ও SMS লিস্ট
  if (id === 'call-list' || id === 'sms-list' || id === 'custom-call-list') {
    return {
      department: 'Telecom CDR & SMS Log Gateway',
      formCode: 'CDR-RECORD-PULL',
      notice: 'টার্গেট মোবাইল নম্বর, অপারেটর এবং কত মাসের কল/এসএমএস ডিটেইলস (CDR) প্রয়োজন তা উল্লেখ করুন।',
      deliveryTime: '৩০-৬০ মিনিট',
      fields: [
        { id: 'phoneNo', label: 'টার্গেট মোবাইল নম্বর (১১ ডিজিট)', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
        { id: 'operator', label: 'সিম অপারেটর', placeholder: 'নির্বাচন করুন', type: 'select', options: ['Grameenphone', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'], required: true, halfWidth: true },
        { id: 'duration', label: 'রেকর্ডের সময়সীমা', placeholder: 'নির্বাচন করুন', type: 'select', options: ['সর্বশেষ ৩ মাস (3 Months)', 'সর্বশেষ ৬ মাস (6 Months)', 'সর্বশেষ ৯ মাস (9 Months)', 'সর্বশেষ ১ মাস (1 Month)'], required: true, halfWidth: true },
      ]
    };
  }

  // ১৭. IMEI টু নাম্বার
  if (id === 'imei-number' || id === 'imei-to-active-numbers') {
    return {
      department: 'NEIR Handset & IMEI Registry Database',
      formCode: 'IMEI-ACTIVE-SIM',
      notice: 'ফোনের বক্স বা *#06# ডায়াল করে পাওয়া ১৫ সংখ্যার সঠিক IMEI নম্বরটি প্রদান করুন।',
      deliveryTime: '৩০-৬০ মিনিট',
      fields: [
        { id: 'imei1', label: '১৫ সংখ্যার IMEI নম্বর (IMEI-1)', placeholder: '15-Digit IMEI (যেমন: 354894210023459)', type: 'text', required: true },
        { id: 'imei2', label: 'দ্বিতীয় স্লটের IMEI নম্বর (IMEI-2 - যদি থাকে)', placeholder: '১৫ সংখ্যার IMEI-2 (ঐচ্ছিক)', type: 'text', required: false, halfWidth: true },
        { id: 'deviceModel', label: 'ফোনের ব্র্যান্ড ও মডেল (যদি জানা থাকে)', placeholder: 'যেমন: Samsung A54 / iPhone 13', type: 'text', required: false, halfWidth: true },
      ]
    };
  }

  // ১৮. বিকাশ / নগদ / রকেট তথ্য
  if (id === 'bkash-info' || id === 'nagad-info' || id === 'rocket-info') {
    const mfsName = id === 'bkash-info' ? 'বিকাশ (bKash)' : id === 'nagad-info' ? 'নগদ (Nagad)' : 'রকেট (Rocket)';
    return {
      department: `MFS KYC Verification • ${mfsName}`,
      formCode: 'MFS-KYC-LOOKUP',
      notice: `${mfsName} একাউন্টের নিবন্ধিত মালিকের নাম, এনআইডি ও কেওয়াইসি তথ্যের জন্য একাউন্ট নম্বরটি দিন।`,
      deliveryTime: '১৫-৩০ মিনিট',
      fields: [
        { id: 'mfsNumber', label: `${mfsName} একাউন্ট মোবাইল নম্বর`, placeholder: '01XXXXXXXXX', type: 'tel', required: true },
        { id: 'accountType', label: 'একাউন্টের ধরন', placeholder: 'নির্বাচন করুন', type: 'select', options: ['পার্সোনাল একাউন্ট (Personal)', 'এজেন্ট একাউন্ট (Agent)', 'মার্চেন্ট একাউন্ট (Merchant)'], required: true },
      ]
    };
  }

  // ১৯. লোকেশন ট্র্যাকিং (সকল লোকেশন সেবা)
  if (service.category === 'location' || id.includes('location')) {
    return {
      department: 'BTS Cell Tower & Live Geo-Location System',
      formCode: 'GSM-LRL-LCL-TRACK',
      notice: 'সঠিক টাওয়ার লোকেশন, লাস্ট কল লোকেশন (LCL) এবং ম্যাপ কো-অর্ডিনেট পেতে সচল মোবাইল নম্বরটি দিন।',
      deliveryTime: '১০-২০ মিনিট',
      fields: [
        { id: 'targetPhone', label: 'টার্গেট মোবাইল নম্বর (১১ ডিজিট)', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
        { id: 'operator', label: 'সিম অপারেটর', placeholder: 'নির্বাচন করুন', type: 'select', options: ['Grameenphone (GP)', 'Robi', 'Banglalink', 'Airtel', 'Teletalk'], required: true, halfWidth: true },
        { id: 'trackType', label: 'লোকেশন রিপোর্ট ফরম্যাট', placeholder: 'নির্বাচন করুন', type: 'select', options: ['লাইভ টাওয়ার ও Google Map লিংক', 'লাস্ট কল লোকেশন (LCL) + IMEI', 'পূর্ণাঙ্গ BTS Cell ID রিপোর্ট'], required: true, halfWidth: true },
      ]
    };
  }

  // ২০. সনদপত্র ও পাসপোর্ট (BMET, পুলিশ ক্লিয়ারেন্স, চারিত্রিক সনদ, ড্রাইভিং লাইসেন্স, পাসপোর্ট)
  if (service.category === 'cert' || service.category === 'certificate') {
    if (id === 'bmet-service') {
      return {
        department: 'জনশক্তি কর্মসংস্থান ও প্রশিক্ষণ ব্যুরো (BMET)',
        formCode: 'BMET-AMI-PROBASHI',
        notice: 'BMET রেজিস্ট্রেশন, ফিঙ্গারপ্রিন্ট বা ক্লিয়ারেন্স যাচাইয়ের জন্য পাসপোর্ট ও এনআইডি তথ্য দিন।',
        deliveryTime: '১-২ ঘণ্টা',
        fields: [
          { id: 'passportNo', label: 'পাসপোর্ট নম্বর (Passport Number)', placeholder: 'যেমন: A01234567 বা EG0123456', type: 'text', required: true, halfWidth: true },
          { id: 'nidNo', label: 'জাতীয় পরিচয়পত্র (NID) নম্বর', placeholder: '১০/১৩/১৭ ডিজিটের NID', type: 'text', required: true, halfWidth: true },
          { id: 'fullName', label: 'যাত্রীর পূর্ণ নাম ও জন্ম তারিখ', placeholder: 'পূর্ণ নাম ও জন্ম তারিখ (DD/MM/YYYY)', type: 'text', required: true },
          { id: 'country', label: 'গন্তব্য দেশ ও মোবাইল নম্বর', placeholder: 'যেমন: সৌদি আরব / মালয়েশিয়া - 01XXXXXXXXX', type: 'text', required: true },
        ]
      };
    }
    return {
      department: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার • Citizen Certificate Desk',
      formCode: `CERT-${id.toUpperCase()}`,
      notice: `${service.banglaTitle || service.title} আবেদনের জন্য এনআইডি/জন্ম সনদ অনুযায়ী নির্ভুল তথ্য প্রদান করুন।`,
      deliveryTime: '২-৬ ঘণ্টা',
      fields: [
        { id: 'fullName', label: 'আবেদনকারীর পূর্ণ নাম (বাংলা ও ইংরেজিতে)', placeholder: 'NID অনুযায়ী পূর্ণ নাম লিখুন', type: 'text', required: true },
        { id: 'nidOrPassport', label: 'NID নম্বর / জন্ম নিবন্ধন / পাসপোর্ট নম্বর', placeholder: 'সঠিক পরিচয়পত্র নম্বর দিন', type: 'text', required: true, halfWidth: true },
        { id: 'dob', label: 'জন্ম তারিখ (DD/MM/YYYY)', placeholder: 'DD/MM/YYYY', type: 'text', required: true, halfWidth: true },
        { id: 'parentsName', label: 'পিতার নাম ও মাতার নাম', placeholder: 'পিতার নাম ও মাতার নাম লিখুন', type: 'text', required: true },
        { id: 'fullAddress', label: 'স্থায়ী ঠিকানা (গ্রাম/মহল্লা, ইউনিয়ন/ওয়ার্ড, থানা/উপজেলা, জেলা)', placeholder: 'সম্পূর্ণ স্থায়ী ঠিকানা লিখুন', type: 'textarea', required: true },
        { id: 'mobile', label: 'সচল মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
      ]
    };
  }

  // ২১. ভূমি সেবা (খতিয়ান, নামজারি, পর্চা)
  if (service.category === 'land') {
    return {
      department: 'ভূমি মন্ত্রণালয় • ই-পর্চা ও নামজারি সিস্টেম (dlrms.land.gov.bd)',
      formCode: 'LAND-KHATIAN-PORCHA',
      notice: 'জমির খতিয়ান/পর্চা বা নামজারির জন্য জেলা, উপজেলা, মৌজা এবং খতিয়ান/দাগ নম্বর সঠিকভাবে পূরণ করুন।',
      deliveryTime: '১-৩ ঘণ্টা',
      fields: [
        { id: 'districtUpazila', label: 'জেলা ও উপজেলা / সার্কেল ভূমি অফিস', placeholder: 'যেমন: জেলা: ঢাকা, উপজেলা: সাভার', type: 'text', required: true, halfWidth: true },
        { id: 'mouzaJl', label: 'মৌজার নাম ও জে.এল (J.L) নম্বর', placeholder: 'মৌজার নাম ও জে.এল নং', type: 'text', required: true, halfWidth: true },
        { id: 'khatianType', label: 'খতিয়ান / সার্ভের ধরন', placeholder: 'নির্বাচন করুন', type: 'select', options: ['আরএস (RS) খতিয়ান', 'বিএস (BS) / সিটি জরিপ', 'এসএ (SA) খতিয়ান', 'সিএস (CS) খতিয়ান', 'নামজারি (Mutation) খতিয়ান', 'বিআরএস (BRS) খতিয়ান'], required: true, halfWidth: true },
        { id: 'khatianDagNo', label: 'খতিয়ান নম্বর ও দাগ নম্বর', placeholder: 'খতিয়ান নং: ... / দাগ নং: ...', type: 'text', required: true, halfWidth: true },
        { id: 'ownerName', label: 'জমির মালিকের নাম ও পিতার নাম', placeholder: 'রেকর্ডীয় মালিকের নাম ও পিতার নাম লিখুন', type: 'text', required: true },
        { id: 'mobile', label: 'আবেদনকারীর মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
      ]
    };
  }

  // ২২. শিক্ষা সেবা (SSC / HSC / Marksheet)
  if (service.category === 'education') {
    return {
      department: 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড • Education Board Bangladesh',
      formCode: 'EDU-BOARD-VERIFIED',
      notice: 'বোর্ড সনদপত্র বা মার্কশিট সংগ্রহের জন্য পরীক্ষার নাম, বোর্ড, পাসের সন, রোল ও রেজিস্ট্রেশন নম্বর দিন।',
      deliveryTime: '১-২ ঘণ্টা',
      fields: [
        { id: 'examType', label: 'পরীক্ষার নাম (Examination)', placeholder: 'নির্বাচন করুন', type: 'select', options: ['SSC / Dakhil / Equivalent', 'HSC / Alim / Equivalent', 'JSC / JDC', 'SSC Vocational / Technical'], required: true, halfWidth: true },
        { id: 'board', label: 'শিক্ষা বোর্ড (Education Board)', placeholder: 'বোর্ড নির্বাচন করুন', type: 'select', options: ['Dhaka (ঢাকা)', 'Rajshahi (রাজশাহী)', 'Comilla (কুমিল্লা)', 'Jessore (যশোর)', 'Chittagong (চট্টগ্রাম)', 'Barisal (বরিশাল)', 'Sylhet (সিলেট)', 'Dinajpur (দিনাজপুর)', 'Mymensingh (ময়মনসিংহ)', 'Madrasah (মাদ্রাসা)', 'Technical (কারিগরি)'], required: true, halfWidth: true },
        { id: 'passingYear', label: 'পাসের সন (Passing Year) ও গ্রুপ', placeholder: 'যেমন: 2020 (Science / Business / Humanities)', type: 'text', required: true, halfWidth: true },
        { id: 'rollNo', label: 'রোল নম্বর (Roll Number)', placeholder: '৬ সংখ্যার রোল নম্বর', type: 'text', required: true, halfWidth: true },
        { id: 'regNo', label: 'রেজিস্ট্রেশন নম্বর ও শিক্ষাবর্ষ (Session)', placeholder: '১০ সংখ্যার রেজিস্ট্রেশন নম্বর ও সেশন', type: 'text', required: true },
        { id: 'studentName', label: 'শিক্ষার্থীর পূর্ণ নাম (ইংরেজি ও বাংলায়)', placeholder: 'সার্টিফিকেট অনুযায়ী পূর্ণ নাম লিখুন', type: 'text', required: true },
      ]
    };
  }

  // ২৩. ট্রেড ও ব্যবসা (Trade License / Company / VAT)
  if (service.category === 'trade') {
    return {
      department: 'বাণিজ্য ও রাজস্ব অনুবিভাগ • Trade & RJSC / BIN Wing',
      formCode: 'TRADE-BIZ-REG',
      notice: 'ব্যবসা প্রতিষ্ঠানের অফিশিয়াল নাম, মালিকের এনআইডি এবং প্রতিষ্ঠানের ঠিকানা প্রদান করুন।',
      deliveryTime: '২-৬ ঘণ্টা',
      fields: [
        { id: 'businessName', label: 'ব্যবসা প্রতিষ্ঠানের নাম (বাংলা ও ইংরেজি)', placeholder: 'প্রতিষ্ঠানের পূর্ণ নাম লিখুন', type: 'text', required: true },
        { id: 'ownerNameNid', label: 'মালিকের নাম ও এনআইডি (NID) নম্বর', placeholder: 'স্বত্বাধিকারীর নাম ও NID নম্বর', type: 'text', required: true },
        { id: 'businessType', label: 'ব্যবসার ধরন ও ই-টিন নম্বর', placeholder: 'যেমন: আইটি / খুচরা ও পাইকারি ব্যবসা / ই-টিন নং', type: 'text', required: true },
        { id: 'businessAddress', label: 'ব্যবসা প্রতিষ্ঠানের পূর্ণ ঠিকানা (সিটি কর্পোরেশন/পৌরসভা/ইউনিয়ন)', placeholder: 'দোকান/হোল্ডিং নং, মার্কেট/রোড, ওয়ার্ড, থানা, জেলা', type: 'textarea', required: true },
        { id: 'mobile', label: 'যোগাযোগের মোবাইল নম্বর', placeholder: '01XXXXXXXXX', type: 'tel', required: true },
      ]
    };
  }

  // ২৪. ইউটিলিটি বিল ও অন্যান্য (বিদ্যুৎ, পানি, গ্যাস, বিবাহ সনদ, ভোটার লিস্ট, সিভি)
  if (id === 'electric-bill' || id === 'water-bill' || id === 'gas-bill') {
    return {
      department: 'জাতীয় ইউটিলিটি বিলিং গেটওয়ে • Utility Ledger',
      formCode: 'UTILITY-BILL-COPY',
      notice: 'মিটার বা গ্রাহক হিসাব নম্বর এবং বিলের মাস উল্লেখ করুন।',
      deliveryTime: '১৫-৩০ মিনিট',
      fields: [
        { id: 'provider', label: 'বিতরণকারী সংস্থা / কোম্পানি', placeholder: 'যেমন: পল্লী বিদ্যুৎ / DESCO / DPDC / BPDB / WASA / তিতাস গ্যাস', type: 'text', required: true },
        { id: 'accountOrMeterNo', label: 'গ্রাহক নম্বর / মিটার নম্বর (Account / Meter No)', placeholder: 'বিলের কাগজে থাকা মিটার বা একাউন্ট নম্বর দিন', type: 'text', required: true },
        { id: 'billMonth', label: 'বিলের মাস ও বছর এবং গ্রাহকের নাম', placeholder: 'যেমন: সেপ্টেম্বর ২০২৬ - গ্রাহকের নাম', type: 'text', required: true },
      ]
    };
  }

  if (id === 'marriage-cert') {
    return {
      department: 'আইন, বিচার ও সংসদ বিষয়ক মন্ত্রণালয় • কাজী অফিস নিবন্ধন',
      formCode: 'MARRIAGE-NIKAHNAMA',
      notice: 'বিবাহ সনদ / কাবিননামার কপির জন্য বর ও কনের এনআইডি অনুযায়ী সঠিক তথ্য দিন।',
      deliveryTime: '১-৩ ঘণ্টা',
      fields: [
        { id: 'groomInfo', label: 'বরের পূর্ণ নাম, পিতার নাম ও NID নম্বর', placeholder: 'বরের নাম, পিতার নাম ও এনআইডি নম্বর', type: 'text', required: true },
        { id: 'brideInfo', label: 'কনের পূর্ণ নাম, পিতার নাম ও NID নম্বর', placeholder: 'কনের নাম, পিতার নাম ও এনআইডি নম্বর', type: 'text', required: true },
        { id: 'marriageDatePlace', label: 'বিবাহের তারিখ, দেনমোহর ও কাজী অফিসের ঠিকানা', placeholder: 'বিবাহের তারিখ (DD/MM/YYYY), দেনমোহরের পরিমাণ ও স্থান', type: 'textarea', required: true },
      ]
    };
  }

  if (id === 'voter-list') {
    return {
      department: 'বাংলাদেশ নির্বাচন কমিশন • Electoral Roll Archive',
      formCode: 'EC-VOTER-ROLL-PDF',
      notice: 'ছবিসহ বা ছবি ছাড়া ভোটার তালিকা PDF ডাউনলোডের জন্য নির্বাচনী এলাকার সঠিক তথ্য দিন।',
      deliveryTime: '৩০-৬০ মিনিট',
      fields: [
        { id: 'districtUpazila', label: 'বিভাগ, জেলা ও উপজেলা/থানা', placeholder: 'যেমন: ঢাকা বিভাগ, গাজীপুর জেলা, শ্রীপুর উপজেলা', type: 'text', required: true },
        { id: 'unionWard', label: 'ইউনিয়ন / পৌরসভা / সিটি কর্পোরেশন ও ওয়ার্ড নং', placeholder: 'ইউনিয়ন/পৌরসভার নাম ও ওয়ার্ড নম্বর (যেমন: ওয়ার্ড নং-০৪)', type: 'text', required: true },
        { id: 'voterAreaName', label: 'ভোটার এলাকার নাম ও কেন্দ্র কোড (যদি জানা থাকে)', placeholder: 'গ্রাম বা মহল্লার নাম এবং পুরুষ/মহিলা তালিকা উল্লেখ করুন', type: 'text', required: true },
      ]
    };
  }

  if (id === 'make-cv') {
    return {
      department: 'প্রফেশনাল ক্যারিয়ার ডেস্ক • Resume & CV Builder',
      formCode: 'PRO-CV-FORMAT',
      notice: 'আধুনিক ও অফিশিয়াল ফরম্যাটে সিভি তৈরির জন্য আপনার ব্যক্তিগত ও শিক্ষাগত তথ্য দিন।',
      deliveryTime: '৩০-৬০ মিনিট',
      fields: [
        { id: 'fullName', label: 'পূর্ণ নাম (ইংরেজি ও বাংলায়) এবং পদবি', placeholder: 'আপনার নাম ও কাঙ্ক্ষিত পদের নাম', type: 'text', required: true },
        { id: 'contact', label: 'মোবাইল নম্বর, ইমেইল ও বর্তমান ঠিকানা', placeholder: '01XXXXXXXXX, email@example.com, ঠিকানা', type: 'text', required: true },
        { id: 'educationExp', label: 'শিক্ষাগত যোগ্যতা (SSC, HSC, Degree) ও অভিজ্ঞতা', placeholder: 'পাসের সন, বোর্ড/বিশ্ববিদ্যালয়, জিপিএ এবং কাজের অভিজ্ঞতা বিস্তারিত লিখুন...', type: 'textarea', required: true },
      ]
    };
  }

  // ডিফল্ট অফিশিয়াল ফর্ম (বাকি সার্ভিসগুলোর জন্য)
  return {
    department: 'বাংলাদেশ ডিজিটাল নাগরিক সেবা পোর্টাল',
    formCode: `GOV-${id.toUpperCase()}`,
    notice: `${service.banglaTitle || service.title} সেবার জন্য প্রয়োজনীয় অফিশিয়াল তথ্য প্রদান করুন।`,
    deliveryTime: service.deliveryTime || service.processingTime || 'তাৎক্ষণিক / ১৫-৩০ মিনিট',
    fields: [
      { id: 'primaryInfo', label: service.inputLabel || 'প্রয়োজনীয় প্রধান নম্বর / আইডি তথ্য', placeholder: service.inputPlaceholder || 'এখানে সঠিক নম্বর বা তথ্য লিখুন...', type: 'text', required: true },
      { id: 'additionalDetails', label: 'বিস্তারিত বিবরণ / অতিরিক্ত তথ্য (ঐচ্ছিক)', placeholder: 'সেবাটি সম্পর্কিত অতিরিক্ত কোনো নির্দেশনা থাকলে লিখুন...', type: 'textarea', required: false },
    ]
  };
}

export default function ServiceViews({
  activeServiceId,
  walletBalance,
  deductFee,
  onBack,
  triggerToast,
  openWallet,
  onOrderPlaced,
}: ServiceViewsProps) {
  // data.ts থেকে সার্ভিসটি খুঁজে নেওয়া
  const service: ServiceDefinition = SYSTEM_SERVICES.find((s: any) => s.id === activeServiceId) || {
    id: activeServiceId,
    title: activeServiceId,
    banglaTitle: activeServiceId === 'server_copy' ? 'সার্ভার কপি' : 'ডিজিটাল সেবা',
    titleEn: 'DIGITAL SERVICE',
    iconType: 'file',
    category: 'all',
    description: '',
    fee: 18,
    price: 18,
    icon: 'file',
    inputLabel: 'প্রয়োজনীয় তথ্য',
    inputPlaceholder: 'এখানে লিখুন...',
  };

  const currentFee = service.fee ?? service.price ?? 18;
  const schema = getOfficialFormSchema(service);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrder, setCompletedOrder] = useState<{
    id: string;
    info: string;
    fee: number;
    deliveryTime?: string;
    files?: string[];
  } | null>(null);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleFileChange = (fieldId: string, file: File | undefined) => {
    if (!file) return;
    setUploadedFiles(prev => ({ ...prev, [fieldId]: file }));
    setFormValues(prev => ({ ...prev, [fieldId]: file.name }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // প্রতিটি রিকোয়ার্ড ফিল্ড ভ্যালিডেশন
    for (const field of schema.fields) {
      if (field.required) {
        if (field.type === 'file') {
          if (!uploadedFiles[field.id]) {
            setErrorMsg(`অনুগ্রহ করে "${field.label}" আপলোড করুন।`);
            return;
          }
        } else {
          const val = (formValues[field.id] || '').trim();
          if (!val) {
            setErrorMsg(`অনুগ্রহ করে "${field.label}" পূরণ করুন।`);
            return;
          }
        }
      }
    }

    if (walletBalance < currentFee) {
      setErrorMsg(`অপ্রতুল ব্যালেন্স! সার্ভিস চার্জ: ${currentFee} ৳। আপনার বর্তমান ব্যালেন্স: ${walletBalance} ৳।`);
      if (openWallet) openWallet();
      return;
    }

    // অফিশিয়াল ফরম্যাটে সমস্ত ফিল্ডের ডাটা একত্রিত করা (ডাটাবেস ও রিসিটের জন্য)
    const lines: string[] = [];
    const filesList: string[] = [];

    for (const field of schema.fields) {
      if (field.type === 'file') {
        const f = uploadedFiles[field.id];
        if (f) {
          lines.push(`${field.label}: ${f.name}`);
          filesList.push(f.name);
        }
      } else {
        const val = (formValues[field.id] || '').trim();
        if (val) {
          lines.push(`${field.label}: ${val}`);
        }
      }
    }

    const compiledInfo = lines.join('\n');
    const deliveryTime = schema.deliveryTime || service.deliveryTime || 'তাৎক্ষণিক';

    setIsSubmitting(true);
    try {
      // deductFee-তে placeholder হিসেবে compiledInfo পাঠানো হচ্ছে যাতে Neon DB-তেও পূর্ণ তথ্য সেভ হয়
      const approved = await deductFee(currentFee, {
        ...service,
        placeholder: compiledInfo,
      });

      if (approved) {
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const orderData = {
          id: orderId,
          serviceId: service.id,
          serviceBanglaTitle: service.banglaTitle || service.title,
          info: compiledInfo,
          files: filesList,
          fee: currentFee,
          status: 'pending',
          deliveryTime: deliveryTime,
          createdAt: new Date().toLocaleTimeString('bn-BD'),
        };

        if (onOrderPlaced) onOrderPlaced(orderData);
        setCompletedOrder({
          id: orderId,
          info: compiledInfo,
          fee: currentFee,
          deliveryTime: deliveryTime,
          files: filesList,
        });
        triggerToast('অর্ডার গৃহীত হয়েছে!', `${service.banglaTitle || service.title} এর অফিশিয়াল আবেদন সফলভাবে সাবমিট হয়েছে।`);
      }
    } catch {
      setErrorMsg('সার্ভারে রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans">
      {/* সেন্ট্রাল অফিশিয়াল ইনফরমেশন বক্স */}
      <div className="w-full max-w-[520px] bg-white rounded-[28px] shadow-2xl p-6 md:p-7 border border-purple-100 animate-scale-up">
        {completedOrder ? (
          /* অর্ডার সফল হওয়ার অফিশিয়াল রিসিট ভিউ */
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200 shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold font-mono uppercase mb-1">
                {schema.formCode} • VERIFIED RECEIPT
              </span>
              <h3 className="text-xl font-bold text-gray-900">অফিশিয়াল অর্ডার জমা হয়েছে</h3>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">ট্র্যাকিং আইডি: #{completedOrder.id}</p>
            </div>

            {completedOrder.deliveryTime && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                <Clock size={13} />
                <span>ডেলিভারি সময়: {completedOrder.deliveryTime}</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-500 border-b border-gray-200/70 pb-2">
                <span>দপ্তর / বিভাগ:</span>
                <span className="font-bold text-gray-800 text-right">{schema.department}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>সেবার নাম:</span>
                <span className="font-bold text-gray-900">{service.banglaTitle || service.title}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>সরকারি ও সার্ভিস ফি কর্তন:</span>
                <span className="font-bold text-[#8000ff] font-mono">৳ {completedOrder.fee} BDT</span>
              </div>

              {completedOrder.files && completedOrder.files.length > 0 && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 block mb-1 font-semibold">সংযুক্ত অফিশিয়াল ডকুমেন্টসমূহ:</span>
                  <div className="space-y-1">
                    {completedOrder.files.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <FileText size={12} className="text-purple-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200">
                <span className="text-gray-500 block mb-1 font-semibold">দাখিলকৃত অফিশিয়াল তথ্য বিবরণী:</span>
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-gray-800 break-words whitespace-pre-line text-[11.5px] leading-relaxed font-medium">
                  {completedOrder.info}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 bg-[#8000ff] hover:bg-[#7200e6] text-white font-semibold text-xs rounded-2xl shadow-md transition cursor-pointer"
            >
              ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
        ) : (
          /* মেইন অফিশিয়াল ফর্ম বক্স */
          <div>
            {/* দপ্তর / অফিশিয়াল ফরম কোড ব্যাজ */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-purple-100">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900">
                <Building2 size={13} className="text-purple-600 shrink-0" />
                <span className="truncate">{schema.department}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[9.5px] font-mono font-bold shrink-0">
                {schema.formCode}
              </span>
            </div>

            {/* ১. হেডার: ক্লিপবোর্ড আইকন + সার্ভিস নাম + চার্জ */}
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center p-2.5 shrink-0">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                  <rect x="8" y="10" width="32" height="34" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
                  <rect x="12" y="14" width="24" height="26" rx="2" fill="#FFFFFF" />
                  <rect x="16" y="4" width="16" height="8" rx="2.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />
                  <circle cx="24" cy="8" r="1.5" fill="#FFFFFF" />
                  <line x1="16" y1="20" x2="32" y2="20" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="26" x2="32" y2="26" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="16" y1="32" x2="26" y2="32" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-snug">
                  {service.banglaTitle || service.title}
                </h3>
                <p className="text-[11px] text-gray-500 font-mono uppercase">{service.title}</p>
                <div className="text-[15px] font-bold text-[#8000ff] mt-0.5">
                  নির্ধারিত চার্জ: {currentFee} ৳
                </div>
              </div>
            </div>

            {/* ডেলিভারি সময় ও অফিশিয়াল নির্দেশনা ব্যাজ */}
            <div className="mb-4 space-y-2">
              {schema.deliveryTime && (
                <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600 shrink-0" />
                    <span>প্রসেসিং ও ডেলিভারি সময়:</span>
                  </span>
                  <span className="font-bold">{schema.deliveryTime}</span>
                </div>
              )}

              {schema.notice && (
                <div className="px-3.5 py-2 rounded-xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-2 text-purple-950 text-[11.5px] leading-relaxed">
                  <ShieldCheck size={15} className="text-purple-600 shrink-0 mt-0.5" />
                  <span>{schema.notice}</span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ২. অফিশিয়াল ডাইনামিক ফর্ম ইনপুট সেকশন */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schema.fields.map((field) => (
                  <div
                    key={field.id}
                    className={field.halfWidth ? 'sm:col-span-1' : 'sm:col-span-2'}
                  >
                    <label className="text-[12px] font-semibold text-gray-700 block mb-1">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff] focus:bg-white transition"
                        required={field.required}
                      >
                        <option value="">-- নির্বাচন করুন --</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl p-3 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff] focus:bg-white transition resize-none"
                        required={field.required}
                      />
                    ) : field.type === 'file' ? (
                      <label className="flex items-center gap-2.5 p-3 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/40 hover:bg-purple-50 cursor-pointer transition">
                        <Upload size={16} className="text-purple-600 shrink-0" />
                        <span className="text-xs text-gray-700 truncate font-medium">
                          {uploadedFiles[field.id]
                            ? `✅ ${uploadedFiles[field.id].name}`
                            : field.placeholder}
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange(field.id, e.target.files?.[0])}
                        />
                      </label>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8000ff]/20 focus:border-[#8000ff] focus:bg-white transition"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* ৩. বাটন: বাতিল + অর্ডার করুন */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 bg-[#edf2f7] hover:bg-[#e2e8f0] text-gray-700 font-semibold text-sm rounded-2xl transition cursor-pointer text-center"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 bg-[#8000ff] hover:bg-[#7200e6] text-white font-semibold text-sm rounded-2xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Send size={15} className="rotate-12" />
                  <span>{isSubmitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}