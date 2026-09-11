import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Deployment URL to BahraichApp backend
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzGXU8GgPmBuD0QCCurjgBm_gia25jVPD-sInd3sDwCBOMPzfafv0KBOrhBXvC-iPCbKA/exec";

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      redirect: 'follow'
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data: data });

  } catch (error: any) {
    console.error("API Bridge Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}