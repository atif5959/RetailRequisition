export type RetailItem = {
  key: string;
  label: string;
  priceKey: string;
  totalKey: string;
  price: number;
};

export const retailHeaderFields = [
  { key: 'RouteCode', label: 'Route Code' },
  { key: 'EmpCode', label: 'Emp Code' },
  { key: 'Location', label: 'Location' },
  { key: 'Origin', label: 'Origin' },
] as const;

export const retailItems: RetailItem[] = [
  { key: 'ENVELOPEWHITESmallPRINTED', label: 'ENVELOPE WHITE Small (PRINTED)', priceKey: 'Price', totalKey: 'Total', price: 2.11 },
  { key: 'ENVELOPEWHITEMEDIUMPRINTED', label: 'ENVELOPE WHITE MEDIUM (PRINTED)', priceKey: 'Price2', totalKey: 'Total2', price: 5.16 },
  { key: 'ENVELOPEWHITELARGEPRINTED', label: 'ENVELOPE WHITE LARGE ( PRINTED)', priceKey: 'Price3', totalKey: 'Total3', price: 6.72 },
  { key: 'FLYEREXPRESSSMALL', label: 'FLYER EXPRESS SMALL', priceKey: 'Price4', totalKey: 'Total4', price: 6.0 },
  { key: 'EXPRESSFLYERLARGE', label: 'EXPRESS FLYER LARGE', priceKey: 'Price5', totalKey: 'Total5', price: 11.0 },
  { key: 'REDBOX1KG', label: 'RED BOX 1KG', priceKey: 'Price6', totalKey: 'Total6', price: 32.95 },
  { key: 'REDBOX2KG', label: 'RED BOX 2KG', priceKey: 'Price7', totalKey: 'Total7', price: 54.07 },
  { key: 'REDBOX3KG', label: 'RED BOX 3KG', priceKey: 'Price8', totalKey: 'Total8', price: 62.8 },
  { key: 'REDBOX5KG', label: 'RED BOX 5KG', priceKey: 'Price9', totalKey: 'Total9', price: 91.2 },
  { key: 'REDBOX10KG', label: 'RED BOX 10KG', priceKey: 'Price10', totalKey: 'Total10', price: 129.6 },
  { key: 'REDBOX15KG', label: 'RED BOX 15KG', priceKey: 'Price11', totalKey: 'Total11', price: 166.85 },
  { key: 'REDBOX20KG', label: 'RED BOX 20KG', priceKey: 'Price12', totalKey: 'Total12', price: 191.3 },
  { key: 'REDBOX25KG', label: 'RED BOX 25KG', priceKey: 'Price13', totalKey: 'Total13', price: 231.0 },
  { key: 'TCSECONOMYBOX2KG', label: 'TCS ECONOMY BOX 2KG', priceKey: 'Price14', totalKey: 'Total14', price: 54.7 },
  { key: 'TCSECONOMYBOX5KG', label: 'TCS ECONOMY BOX 5KG', priceKey: 'Price15', totalKey: 'Total15', price: 91.2 },
  { key: 'TCSECONOMYBOX10KG', label: 'TCS ECONOMY BOX 10KG', priceKey: 'Price16', totalKey: 'Total16', price: 129.6 },
  { key: 'TCSECONOMYBOX25KG', label: 'TCS ECONOMY BOX 25KG', priceKey: 'Price17', totalKey: 'Total17', price: 216.0 },
  { key: 'ThermalPrinterRoll', label: 'Thermal Printer Roll', priceKey: 'Price18', totalKey: 'Total18', price: 134.0 },
  { key: 'PackagingTape1', label: 'Packaging Tape 1"', priceKey: 'Price19', totalKey: 'Total19', price: 59.0 },
  { key: 'PackagingTape2', label: 'Packaging Tape 2"', priceKey: 'Price20', totalKey: 'Total20', price: 115.0 },
  { key: 'PLASTICBAG', label: 'PLASTIC BAG', priceKey: 'Price21', totalKey: 'Total21', price: 280.0 },
  { key: 'STICKERFRAGILE', label: 'STICKER FRAGILE', priceKey: 'Price22', totalKey: 'Total22', price: 1.94 },
  { key: 'STICKERTIMECHOICEDELIVERY', label: 'STICKER TIME CHOICE DELIVERY', priceKey: 'Price23', totalKey: 'Total23', price: 1.02 },
  { key: 'STICKEREXTRACARE', label: 'STICKER EXTRA CARE', priceKey: 'Price24', totalKey: 'Total24', price: 1.94 },
  { key: 'STICKERSSPECIALINSTRUCTION', label: 'STICKERS SPECIAL INSTRUCTION', priceKey: 'Price25', totalKey: 'Total25', price: 1.94 },
  { key: 'STICKERECONOMYEXPRESS2NDDay', label: 'STICKER ECONOMY EXPRESS 2ND Day', priceKey: 'Price26', totalKey: 'Total26', price: 1.63 },
  { key: 'MARKERTOYO', label: 'MARKER TOYO', priceKey: 'Price27', totalKey: 'Total27', price: 29.9 },
  { key: 'STAPLERPINMEDIUM', label: 'STAPLER PIN MEDIUM', priceKey: 'Price28', totalKey: 'Total28', price: 45.0 },
  { key: 'CUTTER', label: 'CUTTER', priceKey: 'Price29', totalKey: 'Total29', price: 33.0 },
  { key: 'PENBALLPOINT', label: 'PEN (BALL POINT)', priceKey: 'Price30', totalKey: 'Total30', price: 7.25 },
  { key: 'MyCollectStickers', label: 'My Collect Stickers', priceKey: 'Price31', totalKey: 'Total31', price: 1.94 },
  { key: 'MyReturnStickers', label: 'My Return Stickers', priceKey: 'Price32', totalKey: 'Total32', price: 1.7 },
  { key: 'RubberBand2No500Gms', label: 'Rubber Band 2 No 500Gms', priceKey: 'Price33', totalKey: 'Total33', price: 550.0 },
  { key: 'HILIGHTERDOLLAR', label: 'HI-LIGHTER DOLLAR', priceKey: 'Price34', totalKey: 'Total34', price: 28.0 },
  { key: 'STAPLERMEDIUM', label: 'STAPLER MEDIUM', priceKey: 'Price35', totalKey: 'Total35', price: 240.0 },
  { key: 'TCSMehfooz', label: 'TCS Mehfooz', priceKey: 'Price36', totalKey: 'Total36', price: 64.0 },
];

export const requiredRetailFieldKeys = retailHeaderFields.map((field) => field.key);
