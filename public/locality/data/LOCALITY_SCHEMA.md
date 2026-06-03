# Locality Data Schema

This document defines the standard data objects used across the Locality platform.
The current frontend may still use mock fields from profiles.js, but new backend-ready
objects should follow this structure.

---

## 1. User Account

Represents a person who can log in to Locality.

```js
UserAccount = {
  id: "user_123",
  email: "owner@example.com",
  fullName: "User Name",

  role: "supplier" | "buyer" | "admin",

  ownedBusinessIds: ["business_123"],

  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
}
```
***

##  2. Business Profile 

```js

BusinessProfile = {
  id: "business_123",

  ownerUserId: "user_123",

  name: "Queen Creek Harvest",

  type: "supplier" | "buyer",

  businessSubtype: "farm" | "restaurant" | "grocer" | "institution" | "market" | "other",

  logo: "Queen Creek Harvest Logo.png",
  logoInitials: "QCH",

  description: "Short public profile description.",

  locationLabel: "Queen Creek, AZ",

  address: {
    line1: "",
    line2: "",
    city: "Queen Creek",
    state: "AZ",
    postalCode: "",
    country: "US"
  },

  coordinates: {
    lat: 33.1917,
    lng: -111.5582
  },

  productFocus: "Leafy greens, tomatoes, seasonal vegetables, herbs",
  productCategories: ["produce", "herbs"],

  organic: true,
  coalitionId: "east-valley-growers",

  deliveryRadius: "100 miles",
  leadTime: "10–14 days",
  minimumOrder: "Fixed",

  preferredRadius: "45 miles",
  orderFrequency: "Weekly",

  featuredInsight: "Above average lead time on certain products.",

  status: "active" | "inactive" | "pending",

  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
}
```

***

## 3. Product Listing
```js
ProductListing = {
  id: "product_123",

  businessId: "business_123",

  name: "Rainbow Carrots",
  category: "root-vegetables",

  priceAmount: 2.5,
  priceUnit: "lb",
  priceDisplay: "$2.50/lb",

  availabilityNote: "Low inventory",
  organic: true,

  minimumOrderQuantity: 25,
  minimumOrderUnit: "lb",

  leadTime: "10–14 days",

  status: "active" | "low_inventory" | "seasonal" | "inactive",

  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
}
```
***

## 4. Contract Draft
```js
ContractDraft = {
  id: "LOC-DRAFT-12345678",
  contractId: "LOC-2026-0041",

  status: "draft" | "sent" | "viewed" | "revision_requested" | "accepted" | "archived",

  agreementType: "fixed" | "flexible" | "seasonal",

  parties: {
    sellerBusinessId: "business_supplier_123",
    buyerBusinessId: "business_buyer_456",
    sellerName: "Queen Creek Harvest",
    buyerName: "Roosevelt Row Market"
  },

  products: [],

  orderingRules: {},
  fulfillment: {},
  payment: {},
  standardTerms: {},
  customClauses: [],

  metadata: {
    source: "contract-studio",
    version: 1
  },

  timestamps: {
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  }
}
```
***

## 5. Conversation
```js
Conversation = {
  id: "conversation_123",

  participantBusinessIds: ["business_123", "business_456"],
  participantUserIds: ["user_123", "user_456"],

  relatedContractId: "LOC-DRAFT-12345678",
  relatedProductIds: ["product_123"],

  status: "active" | "archived",

  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
}
```
***

## 6. Conversation**
```js
Conversation = {
  id: "conversation_123",

  participantBusinessIds: ["business_123", "business_456"],
  participantUserIds: ["user_123", "user_456"],

  relatedContractId: "LOC-DRAFT-12345678",
  relatedProductIds: ["product_123"],

  status: "active" | "archived",

  createdAt: "2026-06-02T00:00:00.000Z",
  updatedAt: "2026-06-02T00:00:00.000Z"
}
```
***

## 7.
