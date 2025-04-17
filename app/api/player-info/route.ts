import { type NextRequest, NextResponse } from "next/server"

// API endpoint for player information
const PLAYER_INFO_API = "https://ariiflexlabs-playerinfo-icxc.onrender.com/ff_info"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const playerId = searchParams.get("id")
    const region = searchParams.get("region") || "ind" // Default to IND region if not specified

    if (!playerId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Player ID is required",
          credits: "TEAM-AKIRU",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Construct the API URL with the player ID and region
    const apiUrl = `${PLAYER_INFO_API}?uid=${playerId}&region=${region.toLowerCase()}`

    console.log("Fetching player info from:", apiUrl)

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store", // Ensure we get fresh data
    })

    if (!response.ok) {
      throw new Error(`API request failed with status code: ${response.status}`)
    }

    const data = await response.json()
    console.log("API response received:", Object.keys(data))

    // Transform the API response to our expected format with all available data
    const playerData = {
      basic_info: {
        id: playerId,
        name: data.AccountInfo?.AccountName || data.captainBasicInfo?.nickname || "Unknown Player",
        level: data.AccountInfo?.AccountLevel || data.captainBasicInfo?.level || null,
        likes: data.AccountInfo?.AccountLikes || data.captainBasicInfo?.liked || null,
        server: data.AccountInfo?.AccountRegion || data.captainBasicInfo?.region || region.toUpperCase(),
        bio: data.socialinfo?.AccountSignature || null,
        booyah_pass_level: null, // Not available in this API
        account_created: data.AccountInfo?.AccountCreateTime
          ? new Date(Number(data.AccountInfo.AccountCreateTime) * 1000).toISOString().split("T")[0]
          : null,
        language: data.socialinfo?.AccountLanguage?.replace("Language_", "") || null,
        preferred_mode: data.socialinfo?.AccountPreferMode?.replace("Prefermode_", "") || null,
        credit_score: data.creditScoreInfo?.creditScore || null,
        account_type: data.AccountInfo?.AccountType || data.captainBasicInfo?.accountType || null,
        exp: data.AccountInfo?.AccountEXP || data.captainBasicInfo?.exp || null,
        rank: {
          br: {
            current: data.AccountInfo?.BrRankPoint || data.captainBasicInfo?.rankingPoints || null,
            max_rank: data.AccountInfo?.BrMaxRank || data.captainBasicInfo?.maxRank || null,
            show: data.AccountInfo?.ShowBrRank || data.captainBasicInfo?.showBrRank || false,
          },
          cs: {
            current: data.AccountInfo?.CsRankPoint || data.captainBasicInfo?.csRankingPoints || null,
            max_rank: data.AccountInfo?.CsMaxRank || data.captainBasicInfo?.csMaxRank || null,
            show: data.AccountInfo?.ShowCsRank || data.captainBasicInfo?.showCsRank || false,
          },
        },
        last_login: data.AccountInfo?.AccountLastLogin
          ? new Date(Number(data.AccountInfo.AccountLastLogin) * 1000).toISOString().split("T")[0]
          : null,
        equipped_weapon: data.AccountInfo?.EquippedWeapon || data.captainBasicInfo?.EquippedWeapon || [],
        title: data.AccountInfo?.Title || data.captainBasicInfo?.title || null,
        avatar_id: data.AccountInfo?.AccountAvatarId || data.captainBasicInfo?.headPic || null,
        banner_id: data.AccountInfo?.AccountBannerId || data.captainBasicInfo?.bannerId || null,
        badge_id: data.AccountInfo?.AccountBPID || data.captainBasicInfo?.badgeId || null,
        badge_count: data.AccountInfo?.AccountBPBadges || data.captainBasicInfo?.badgeCnt || null,
        season_id: data.AccountInfo?.AccountSeasonId || data.captainBasicInfo?.seasonId || null,
        release_version: data.AccountInfo?.ReleaseVersion || data.captainBasicInfo?.releaseVersion || null,
      },
      Guild: data.GuildInfo
        ? {
            name: data.GuildInfo.GuildName || null,
            id: data.GuildInfo.GuildID || null,
            level: data.GuildInfo.GuildLevel || null,
            members_count: data.GuildInfo.GuildMember || null,
            capacity: data.GuildInfo.GuildCapacity || null,
            leader: {
              id: data.GuildInfo.GuildOwner || null,
              name: null, // Not available in this API
              level: null, // Not available in this API
            },
          }
        : null,
      animal: data.petInfo
        ? {
            name: "Pet", // Specific name not available in this API
            id: data.petInfo.id || null,
            level: data.petInfo.level || null,
            exp: data.petInfo.exp || null,
            is_selected: data.petInfo.isSelected || false,
            skin_id: data.petInfo.skinId || null,
            selected_skill_id: data.petInfo.selectedSkillId || null,
          }
        : null,
      outfit: data.AccountProfileInfo?.EquippedOutfit || [],
      skills: data.AccountProfileInfo?.EquippedSkills || [],
      // Include raw data for debugging if needed
      raw_data: {
        socialinfo: data.socialinfo || null,
        creditScoreInfo: data.creditScoreInfo || null,
      },
    }

    return NextResponse.json({
      status: "success",
      message: "Player information retrieved successfully",
      data: playerData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error in player-info API:", error)

    // Try fallback to shop2game.com API if the main API fails
    try {
      const playerId = request.nextUrl.searchParams.get("id")
      if (!playerId) throw new Error("Player ID is required")

      const playerInfoResponse = await fetch("https://shop2game.com/api/auth/player_id_login", {
        method: "POST",
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
          Connection: "keep-alive",
          Origin: "https://shop2game.com",
          Referer: "https://shop2game.com/app/100067/idlogin",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          app_id: 100067,
          login_id: playerId,
          app_server_id: 0,
        }),
      })

      if (playerInfoResponse.ok) {
        const playerData = await playerInfoResponse.json()

        return NextResponse.json({
          status: "success",
          message: "Basic player information retrieved (fallback)",
          data: {
            basic_info: {
              id: playerId,
              name: playerData.nickname || `Player ${playerId.substring(0, 4)}...`,
              level: playerData.level || null,
              server: playerData.region || "Unknown",
            },
            Guild: playerData.guild_name
              ? {
                  name: playerData.guild_name,
                  id: playerData.guild_id || "",
                  level: null,
                  members_count: null,
                  leader: null,
                }
              : null,
          },
          timestamp: new Date().toISOString(),
        })
      }
    } catch (fallbackError) {
      console.error("Fallback error:", fallbackError)
    }

    return NextResponse.json(
      {
        status: "error",
        message: `An unexpected error occurred: ${error.message}`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
