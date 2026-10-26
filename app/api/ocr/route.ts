export async function POST(request: Request) {
 try {
  if (!process.env.MISTRAL_API_KEY) return Response.json({error:"Mistral n’est pas configuré. Ajoutez MISTRAL_API_KEY dans .env.local ou utilisez le mode exemple."},{status:503});
  const form = await request.formData();
  const file = form.get("file"); const kind = Number(form.get("kind"));
  if (!(file instanceof File) || ![0,1,2].includes(kind) || !["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type) || file.size > 10*1024*1024) return Response.json({error:"Document invalide (JPG, PNG, WebP, PDF ; 10 Mo maximum)."},{status:400});
  const keys=[["name","identity","address"],["licence","category","expiry"],["brand","plate","vin"]][kind];
  const encoded=`data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
  const document=file.type==="application/pdf"?{type:"document_url",document_url:encoded}:{type:"image_url",image_url:encoded};
  const result=await fetch("https://api.mistral.ai/v1/ocr",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.MISTRAL_API_KEY}`},body:JSON.stringify({model:"mistral-ocr-latest",document,include_image_base64:false,document_annotation_format:{type:"json_schema",json_schema:{name:"rental_document",strict:true,schema:{type:"object",properties:Object.fromEntries(keys.map(k=>[k,{type:"string"}])),required:keys,additionalProperties:false}}},document_annotation_prompt:"Extract the requested fields from this Moroccan document. Transcribe Latin script where available. name=full name; identity=CNIE number; address=address; licence=driving licence number; category=licence category; expiry=expiry date YYYY-MM-DD; brand=vehicle make and model; plate=registration number; vin=chassis number. Return empty string for absent or unreadable fields. Never invent values."}),signal:AbortSignal.timeout(60000)});
  if(!result.ok)return Response.json({error:"La lecture Mistral a échoué. Vérifiez votre clé, votre connexion et réessayez."},{status:502});
  const json=await result.json();const parsed=typeof json.document_annotation==="string"?JSON.parse(json.document_annotation):json.document_annotation;
  if(!parsed||typeof parsed!=="object")throw new Error("Invalid extraction");
  return Response.json({fields:Object.fromEntries(keys.map(k=>[k,typeof parsed[k]==="string"?parsed[k]:""]))},{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({error:"Impossible de lire le document. Réessayez avec une image plus nette."},{status:500});}
}
