import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    const combinedData: Array<{ uid: string; password: string }> = []

    // Process each file
    for (const file of files) {
      try {
        const fileContent = await file.text()
        const jsonData = JSON.parse(fileContent)

        // Extract the required data
        if (
          jsonData.guest_account_info &&
          jsonData.guest_account_info["com.garena.msdk.guest_uid"] &&
          jsonData.guest_account_info["com.garena.msdk.guest_password"]
        ) {
          combinedData.push({
            uid: jsonData.guest_account_info["com.garena.msdk.guest_uid"],
            password: jsonData.guest_account_info["com.garena.msdk.guest_password"],
          })
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    if (combinedData.length === 0) {
      return NextResponse.json({ error: "No valid data found in the uploaded files" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: combinedData })
  } catch (error) {
    console.error("Error processing files:", error)
    return NextResponse.json({ error: "Failed to process files" }, { status: 500 })
  }
}
