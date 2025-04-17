import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const uid = searchParams.get("uid")
    const server = searchParams.get("server")

    if (!uid || !server) {
      return NextResponse.json({ error: "Missing required parameters: uid and server" }, { status: 400 })
    }

    // Call the external API
    const apiUrl = `https://myapihanif.vercel.app/like?uid=${uid}&server_name=${server}`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed with status: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in like-sender API:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
