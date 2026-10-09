'use client';
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export type SeoPageType = 'home' | 'shop' | 'category' | 'best-sellers' | 'new-arrivals';

interface SeoContentBlockProps {
  pageType: SeoPageType;
  categoryName?: string;
}

export default function SeoContentBlock({ pageType, categoryName }: SeoContentBlockProps) {
  const { language } = useLanguage();

  const cName = categoryName || 'Products';

  const content = {
    home: {
      en: [
        {
          title: "Why BDNeeds is the Best Online Shopping Destination in Bangladesh",
          blocks: [
            "BDNeeds is rapidly emerging as a top-tier e-commerce platform in Bangladesh, offering a seamless online shopping experience for regular shoppers. Whether you're hunting for the latest smart gadgets, trendy clothing, or essential stationary items, our extensive catalog is built to serve your daily lifestyle needs at the best prices.",
            "Our user-friendly platform allows you to compare prices, read genuine customer reviews, and securely place orders. We aim to bridge the gap between premium products and Bangladeshi consumers by delivering reliable, high-quality items straight to your doorstep."
          ]
        },
        {
          title: "100% Authentic Gadgets, Clothing & Lifestyle Products",
          blocks: [
            "We know authenticity matters. That is why BDNeeds guarantees 100% genuine products across all our categories, from tech accessories to fashion apparel and stationary. We source directly from authorized distributors to ensure every item you purchase is exactly what you expect.",
            "By maintaining strict vendor guidelines, we protect our customers from counterfeit goods. Shop with confidence knowing that trust, affordability, and transparency are the core pillars of BDNeeds."
          ]
        },
        {
          title: "Fast Home Delivery & Hassle-Free Returns in BD",
          blocks: [
            "We understand that once you order a new gadget or outfit, you want it fast. BDNeeds boasts a robust logistics network capable of delivering products across all 64 districts of Bangladesh. Enjoy our expedited shipping and cash-on-delivery (COD) options for a completely risk-free experience.",
            "Your satisfaction is our priority. If you receive a defective item, our easy 7-day return and refund policy ensures you can send it back without any hassle. Make BDNeeds your go-to online store today!"
          ]
        }
      ],
      bn: [
        {
          title: "বিডিনিডস (BDNeeds) কেন বাংলাদেশের সেরা অনলাইন শপিং ওয়েবসাইট?",
          blocks: [
            "বিডিনিডস (BDNeeds) বাংলাদেশের অন্যতম বিশ্বস্ত ই-কমার্স প্ল্যাটফর্ম হিসেবে রেগুলার শপারদের দিচ্ছে এক অনন্য শপিং অভিজ্ঞতা। আপনি লেটেস্ট স্মার্ট গ্যাজেট, ট্রেন্ডি পোশাক (Clothing), নাকি দরকারি স্টেশনারি আইটেম খুঁজছেন? আমাদের সুবিশাল কালেকশনে দৈনন্দিন লাইফস্টাইলের সবকিছুই পাচ্ছেন সেরা দামে।",
            "আমাদের সহজ ইন্টারফেস ব্যবহার করে আপনি ঘরে বসেই হাজারো পণ্যের দাম তুলনা করতে পারবেন এবং অরিজিনাল কাস্টমার রিভিউ দেখে নিশ্চিন্তে অর্ডার করতে পারবেন। সাশ্রয়ী মূল্যে সেরা মানের পণ্য বাংলাদেশের যেকোনো প্রান্তে পৌঁছে দেওয়াই আমাদের মূল লক্ষ্য।"
          ]
        },
        {
          title: "১০০% অরিজিনাল গ্যাজেট, পোশাক এবং স্টেশনারি পণ্য",
          blocks: [
            "অনলাইন কেনাকাটায় আসল পণ্য পাওয়াটা খুবই জরুরি। তাই বিডিনিডস ১০০% অরিজিনাল গ্যাজেট, টেক এক্সেসরিজ, ফ্যাশন এবং স্টেশনারি পণ্যের নিশ্চয়তা দেয়। আমরা সরাসরি অনুমোদিত ডিস্ট্রিবিউটরদের কাছ থেকে পণ্য সংগ্রহ করি, যাতে আপনি নিশ্চিন্তে কেনাকাটা করতে পারেন।",
            "আমাদের কড়া ভেন্ডর গাইডলাইন আপনাকে নকল পণ্য থেকে রক্ষা করে। সাশ্রয়ী দাম, বিশ্বাস এবং স্বচ্ছতাই বিডিনিডসের ব্যবসার মূলভিত্তি।"
          ]
        },
        {
          title: "সারাদেশে দ্রুততম হোম ডেলিভারি এবং সহজ রিটার্ন পলিসি",
          blocks: [
            "আমরা জানি, অনলাইনে কোনো গ্যাজেট বা শার্ট অর্ডার করার পর সেটি দ্রুত হাতে পাওয়ার জন্য সবাই অপেক্ষা করেন। বিডিনিডস-এর শক্তিশালী লজিস্টিক নেটওয়ার্ক বাংলাদেশের ৬৪টি জেলায় দ্রুততম সময়ে পণ্য পৌঁছে দিতে সক্ষম। সাথে থাকছে ক্যাশ অন ডেলিভারি (COD) সুবিধা, যা আপনার শপিংকে করবে সম্পূর্ণ ঝুঁকিমুক্ত।",
            "গ্রাহক সন্তুষ্টিই আমাদের প্রধান লক্ষ্য। কোনো কারণে ভুল বা ত্রুটিযুক্ত পণ্য পেলে আমাদের '৭ দিনের সহজ রিটার্ন পলিসি'র মাধ্যমে কোনো ঝামেলা ছাড়াই তা ফেরত দিতে পারবেন। আজই বিডিনিডস থেকে আপনার পছন্দের পণ্যটি অর্ডার করুন!"
          ]
        }
      ]
    },
    shop: {
      en: [
        {
          title: "The Largest Collection of Daily Essentials & Luxury Items",
          blocks: [
            "Welcome to the central hub of BDNeeds. Our comprehensive shop features thousands of products carefully curated to cater to every aspect of your lifestyle. From budget-friendly daily necessities to premium luxury items, we offer a diverse range of options that fit every budget.",
            "Explore our neatly organized categories to find exactly what you're looking for, or browse through our catalog to discover new and exciting products."
          ]
        },
        {
          title: "How to Find the Best Deals Online at BDNeeds",
          blocks: [
            "Finding a great bargain has never been easier. Use our advanced filtering and sorting tools to discover products with the highest discounts, or sort by lowest price to stay within your budget. Keep an eye out for our flash sales and seasonal campaigns where prices drop significantly.",
            "Don't forget to apply coupon codes at checkout to maximize your savings. Shopping smart means getting the best quality without breaking the bank."
          ]
        },
        {
          title: "Quality Assurance for Every Product We Sell",
          blocks: [
            "Every product listed in our shop goes through a strict quality assurance process. We work closely with our suppliers to ensure that the descriptions match the actual products.",
            "Additionally, many of our electronics and premium lifestyle products come with official brand warranties, giving you total peace of mind long after your purchase."
          ]
        }
      ],
      bn: [
        {
          title: "প্রয়োজনীয় এবং লাক্সারি পণ্যের সবচেয়ে বড় কালেকশন",
          blocks: [
            "বিডিনিডস-এর মূল শপে আপনাকে স্বাগতম। আপনার লাইফস্টাইলের প্রতিটি দিকের কথা মাথায় রেখে হাজারো পণ্যের এক বিশাল সমাহার সাজিয়েছি আমরা। বাজেটের ভেতরের দৈনন্দিন দরকারি জিনিস থেকে শুরু করে প্রিমিয়াম লাক্সারি আইটেম—সবকিছুই পাবেন এখানে।",
            "আমাদের সুন্দরভাবে সাজানো ক্যাটাগরিগুলো ঘুরে দেখুন এবং খুব সহজেই আপনার প্রয়োজনীয় পণ্যটি খুঁজে নিন অথবা নতুন সব দারুণ প্রোডাক্ট আবিষ্কার করুন।"
          ]
        },
        {
          title: "বিডিনিডস-এ কীভাবে সেরা ডিল ও ডিসকাউন্ট পাবেন?",
          blocks: [
            "কম দামে ভালো পণ্য খুঁজে পাওয়া এখন আরও সহজ। আমাদের অ্যাডভান্সড ফিল্টারিং অপশন ব্যবহার করে সর্বোচ্চ ডিসকাউন্ট থাকা পণ্যগুলো খুঁজে বের করুন অথবা 'Lowest Price' সর্ট করে আপনার বাজেটের মধ্যে কেনাকাটা করুন। আমাদের ফ্ল্যাশ সেল এবং সিজনাল অফারগুলোতে নজর রাখুন।",
            "চেকআউট করার সময় কুপন কোড ব্যবহার করতে ভুলবেন না। স্মার্ট শপিং মানেই হলো বাজেটের মধ্যে সেরা মানের পণ্যটি লুফে নেওয়া।"
          ]
        },
        {
          title: "আমাদের প্রতিটি পণ্যের কোয়ালিটি নিশ্চয়তা",
          blocks: [
            "আমাদের শপে লিস্ট করা প্রতিটি পণ্য কঠোর কোয়ালিটি চেকিংয়ের মধ্য দিয়ে যায়। পণ্যের বিবরণ ও আসল পণ্যের মধ্যে যেন কোনো অমিল না থাকে, সেজন্য আমরা সাপ্লায়ারদের সাথে নিবিড়ভাবে কাজ করি।",
            "এছাড়া, আমাদের বেশিরভাগ ইলেকট্রনিক্স ও প্রিমিয়াম পণ্যের সাথে থাকে অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি, যা আপনাকে কেনাকাটার পরও দেয় সম্পূর্ণ মানসিক শান্তি।"
          ]
        }
      ]
    },
    category: {
      en: [
        {
          title: `Buy Premium ${cName} in Bangladesh`,
          blocks: [
            `Are you searching for the finest ${cName} in Bangladesh? BDNeeds is your ultimate destination. We have assembled a premium selection of ${cName} designed to meet global standards. Whether you prioritize aesthetics, durability, or performance, our collection offers something for everyone.`,
            `We continuously update our ${cName} catalog to include the latest releases from top global and local brands, ensuring you never miss out on the newest trends.`
          ]
        },
        {
          title: `Top Trends & Best Selling ${cName}`,
          blocks: [
            `Stay ahead of the curve by exploring our most popular ${cName}. Our best-sellers reflect the current market trends and customer preferences in Bangladesh. By analyzing thousands of customer reviews and purchase patterns, we highlight the most reliable and highly-rated items in this category.`,
            `Don't just take our word for it—read the verified customer reviews on each product page to see why these specific items are flying off our virtual shelves.`
          ]
        },
        {
          title: `How to Choose the Perfect ${cName} for Your Needs`,
          blocks: [
            `Selecting the right product from a vast collection of ${cName} can be overwhelming. We recommend filtering your search based on your specific requirements, such as brand preference, price range, and key features. Pay close attention to the detailed specifications provided on our product pages.`,
            `If you need further assistance, our dedicated customer support team is always ready to provide personalized recommendations to help you make an informed decision.`
          ]
        },
        {
          title: `Warranty & After-Sales Support for ${cName}`,
          blocks: [
            `We believe that our relationship with you doesn't end at checkout. The majority of our ${cName} come with official manufacturer warranties. In case of any technical issues or manufacturing defects, our after-sales support team will guide you through the claim process smoothly.`,
            `Shop with absolute confidence knowing that BDNeeds stands firmly behind the quality of every item we deliver.`
          ]
        }
      ],
      bn: [
        {
          title: `বাংলাদেশে সেরা ${cName} কিনুন বিডিনিডস থেকে`,
          blocks: [
            `আপনি কি বাংলাদেশে সেরা মানের ${cName} খুঁজছেন? বিডিনিডস আপনার জন্য নিয়ে এসেছে গ্লোবাল স্ট্যান্ডার্ডের এক বিশাল কালেকশন। আপনি যদি পণ্যের টেকসই মান, সুন্দর ডিজাইন বা পারফরম্যান্সের খোঁজ করে থাকেন, তবে আমাদের এই কালেকশনে আপনার জন্য সবকিছুই রয়েছে।`,
            `আমরা নিয়মিত আমাদের ${cName} ক্যাটালগ আপডেট করি, যাতে আপনি দেশি-বিদেশি সেরা ব্র্যান্ডগুলোর নতুন সব প্রোডাক্ট সবার আগে উপভোগ করতে পারেন।`
          ]
        },
        {
          title: `বর্তমান ট্রেন্ড এবং বেস্ট সেলিং ${cName}`,
          blocks: [
            `আমাদের সবচেয়ে জনপ্রিয় ${cName} গুলো এক্সপ্লোর করে বর্তমান ট্রেন্ডের সাথে আপডেট থাকুন। আমাদের বেস্ট সেলার প্রোডাক্টগুলো বাংলাদেশের ক্রেতাদের বর্তমান চাহিদা ও পছন্দের প্রতিফলন। হাজারো ক্রেতার রিভিউ এবং ক্রয়ের ধরন বিশ্লেষণ করে আমরা এই ক্যাটাগরির সেরা পণ্যগুলো আপনাদের সামনে তুলে ধরি।`,
            `পণ্যগুলো কেন এত জনপ্রিয় তা বুঝতে প্রতিটি প্রোডাক্ট পেজে থাকা ভেরিফায়েড কাস্টমারদের রিভিউগুলো পড়ে দেখতে পারেন।`
          ]
        },
        {
          title: `আপনার প্রয়োজন অনুযায়ী সঠিক ${cName} কীভাবে বেছে নিবেন?`,
          blocks: [
            `বিশাল কালেকশন থেকে সঠিক পণ্যটি বেছে নেওয়া অনেক সময় কঠিন মনে হতে পারে। তাই আমরা পরামর্শ দিই আপনার বাজেট, পছন্দের ব্র্যান্ড এবং ফিচারের ওপর ভিত্তি করে ফিল্টার ব্যবহার করার। প্রতিটি প্রোডাক্ট পেজে দেওয়া বিস্তারিত স্পেসিফিকেশনগুলো ভালোভাবে পড়ে নিন।`,
            `এরপরও যদি কোনো কনফিউশন থাকে, তবে আমাদের কাস্টমার সাপোর্ট টিম আপনাকে সঠিক পণ্যটি বাছাই করতে সাহায্য করার জন্য সবসময় প্রস্তুত রয়েছে।`
          ]
        },
        {
          title: `${cName}-এর ওপর ওয়ারেন্টি এবং আফটার-সেলস সাপোর্ট`,
          blocks: [
            `আমরা বিশ্বাস করি যে পণ্য বিক্রির মাধ্যমেই আমাদের দায়িত্ব শেষ হয়ে যায় না। আমাদের বেশিরভাগ ${cName}-এর সাথেই রয়েছে অফিসিয়াল ব্র্যান্ড ওয়ারেন্টি। পণ্য ব্যবহারের সময় কোনো ত্রুটি বা সমস্যা দেখা দিলে আমাদের আফটার-সেলস সাপোর্ট টিম আপনাকে ওয়ারেন্টি ক্লেইম করতে পুরোপুরি সাহায্য করবে।`,
            `বিডিনিডস সবসময় পণ্যের গুণগত মানের নিশ্চয়তা দেয়, তাই সম্পূর্ণ নিশ্চিন্তে কেনাকাটা করুন।`
          ]
        }
      ]
    },
    'best-sellers': {
      en: [
        {
          title: "Top Rated Products Loved by Thousands in Bangladesh",
          blocks: [
            "Welcome to our Best Sellers page—the ultimate collection of products that our customers simply cannot get enough of. These items have earned top ratings and glowing reviews from thousands of verified buyers across Bangladesh.",
            "When you choose from our best-sellers, you are choosing tried, tested, and highly recommended products."
          ]
        },
        {
          title: "Why These Products are Trending Right Now",
          blocks: [
            "Products make it to this list for a reason: a perfect combination of premium quality, high utility, and unbeatable pricing. Whether it's a viral skincare product or a highly efficient kitchen appliance, these items are solving real problems for our customers.",
            "Stay in the loop with what's hot and trending in the market by keeping an eye on this constantly updating list."
          ]
        },
        {
          title: "Unbeatable Value on Our Most Popular Items",
          blocks: [
            "Because these items are sold in high volumes, we are often able to secure better deals from our suppliers, passing those savings directly down to you. Enjoy premium quality at the most competitive prices.",
            "Grab them before they run out of stock, as our best-sellers are always in extremely high demand!"
          ]
        }
      ],
      bn: [
        {
          title: "হাজারো ক্রেতার পছন্দের টপ রেটেড প্রোডাক্টস",
          blocks: [
            "আমাদের বেস্ট সেলার পেজে আপনাকে স্বাগতম! এখানে রয়েছে সেইসব পণ্য, যেগুলো আমাদের গ্রাহকরা সবচেয়ে বেশি পছন্দ করেছেন। বাংলাদেশের হাজার হাজার ভেরিফায়েড ক্রেতার ফাইভ-স্টার রেটিং এবং পজিটিভ রিভিউ পাওয়া পণ্যগুলোই এখানে জায়গা পেয়েছে।",
            "আমাদের বেস্ট সেলার তালিকা থেকে পণ্য কেনার মানে হলো আপনি পরীক্ষিত এবং সবার দ্বারা প্রস্তাবিত সেরা জিনিসটিই বেছে নিচ্ছেন।"
          ]
        },
        {
          title: "এই পণ্যগুলো বর্তমানে কেন এত ট্রেন্ডিং?",
          blocks: [
            "পণ্যগুলো এমনি এমনি এই তালিকায় আসেনি; বরং প্রিমিয়াম কোয়ালিটি, দারুণ উপযোগিতা এবং সাশ্রয়ী দামের এক পারফেক্ট কম্বিনেশনের কারণেই এগুলো এত জনপ্রিয়। হোক তা কোনো ভাইরাল স্কিনকেয়ার প্রোডাক্ট বা রান্নাঘরের দরকারি গ্যাজেট—এই পণ্যগুলো মানুষের দৈনন্দিন সমস্যার সমাধান দিচ্ছে।",
            "বাজারে বর্তমানে কী চলছে এবং মানুষ কী কিনছে, তার সব আপডেট পেতে এই পেজটিতে নিয়মিত চোখ রাখুন।"
          ]
        },
        {
          title: "জনপ্রিয় পণ্যগুলোতে সবচেয়ে সাশ্রয়ী মূল্য",
          blocks: [
            "যেহেতু এই পণ্যগুলো প্রচুর পরিমাণে বিক্রি হয়, তাই আমরা সাপ্লায়ারদের কাছ থেকে বিশেষ ডিসকাউন্ট পেয়ে থাকি, যার সুবিধা আমরা সরাসরি আপনাদের দিয়ে দিই। এর ফলে আপনি সেরা পণ্যটি পান সবচেয়ে সাশ্রয়ী দামে।",
            "স্টক শেষ হওয়ার আগেই আপনার পছন্দের পণ্যটি লুফে নিন, কারণ আমাদের বেস্ট সেলারগুলোর চাহিদা সবসময়ই তুঙ্গে থাকে!"
          ]
        }
      ]
    },
    'new-arrivals': {
      en: [
        {
          title: "Discover the Latest Trends & Tech in Bangladesh",
          blocks: [
            "Step into the future with our New Arrivals collection. Here, we showcase the absolute newest additions to our inventory, from the latest gadgets and electronics to fresh seasonal fashion drops.",
            "If you love staying ahead of the curve and owning the newest tech or fashion before anyone else, this is the perfect place for you."
          ]
        },
        {
          title: "Be the First to Experience Our Newest Products",
          blocks: [
            "We constantly partner with emerging brands and established industry leaders to bring fresh, innovative products to the Bangladeshi market. Buying from our new arrivals means you get to experience cutting-edge features and designs first-hand.",
            "Don't wait for others to review them—be the trendsetter in your circle."
          ]
        },
        {
          title: "Why Upgrading to the Latest Gear Matters",
          blocks: [
            "Technology and fashion are always evolving. Upgrading to the latest products often means better efficiency, improved safety, and more sustainable materials. Our new arrivals are carefully vetted to ensure they offer significant improvements over older models.",
            "Explore the collection today and give your lifestyle the modern upgrade it deserves."
          ]
        }
      ],
      bn: [
        {
          title: "বাংলাদেশে লেটেস্ট ট্রেন্ড এবং টেকনোলজি আবিষ্কার করুন",
          blocks: [
            "আমাদের 'নিউ অ্যারাইভাল' বা নতুন পণ্যের কালেকশনের সাথে ভবিষ্যতের এক ধাপ কাছে এগিয়ে যান। লেটেস্ট গ্যাজেট থেকে শুরু করে নতুন সিজনের ফ্যাশন কালেকশন—আমাদের ইনভেন্টরিতে যুক্ত হওয়া একদম নতুন সবকিছু আপনি এখানে পাবেন।",
            "আপনি যদি সবসময় ট্রেন্ডের সাথে আপডেট থাকতে ভালোবাসেন এবং সবার আগে নতুন জিনিসটি ব্যবহার করতে চান, তবে এটি আপনার জন্য পারফেক্ট জায়গা।"
          ]
        },
        {
          title: "সবার আগে এক্সপেরিয়েন্স করুন আমাদের নতুন পণ্যগুলো",
          blocks: [
            "বাংলাদেশের বাজারে নতুন এবং ইনোভেটিভ প্রোডাক্ট নিয়ে আসার জন্য আমরা দেশি-বিদেশি বিভিন্ন জনপ্রিয় ব্র্যান্ডের সাথে নিয়মিত কাজ করছি। নতুন রিলিজ হওয়া পণ্য কেনার মানে হলো আপনি সবার আগে লেটেস্ট ফিচার এবং ডিজাইনের অভিজ্ঞতা পাচ্ছেন।",
            "অন্যদের রিভিউর জন্য অপেক্ষা না করে নিজেই আপনার সার্কেলের ট্রেন্ডসেটার হয়ে উঠুন।"
          ]
        },
        {
          title: "লেটেস্ট জিনিসে আপগ্রেড করা কেন জরুরি?",
          blocks: [
            "টেকনোলজি এবং ফ্যাশন প্রতিনিয়ত বদলাচ্ছে। লেটেস্ট প্রোডাক্টে আপগ্রেড করার অর্থ হলো আরও ভালো পারফরম্যান্স, উন্নত নিরাপত্তা এবং আধুনিক ফিচারের সুবিধা পাওয়া। আমরা বাছাই করা এমন সব নতুন পণ্য নিয়ে আসি, যা আগের মডেলগুলোর চেয়ে অনেক বেশি উন্নত।",
            "আজই আমাদের নতুন কালেকশন ঘুরে দেখুন এবং আপনার লাইফস্টাইলকে দিন এক আধুনিক ছোঁয়া।"
          ]
        }
      ]
    }
  };

  const data = content[pageType]?.[language] || [];

  if (!data || data.length === 0) return null;

  return (
    <section className="bg-slate-50 py-6 sm:py-6 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:gap-10">
          {data.map((blog, idx) => (
            <div key={idx} className="prose prose-sm sm:prose-base prose-slate max-w-none text-slate-600">
              <h2 className="text-lg sm:text-xl font-bold text-[#0B132B] mb-4 leading-snug">{blog.title}</h2>
              <div className="space-y-3 text-justify">
                {blog.blocks.map((block, pIdx) => (
                  <p key={pIdx} className="leading-relaxed m-0">{block}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
