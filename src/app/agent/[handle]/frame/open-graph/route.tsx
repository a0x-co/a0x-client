import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const logoA0X = searchParams.get("logoA0X");
    const pfpAgent = searchParams.get("pfpAgent");

    const cover =
      searchParams.get("cover") === "undefined" ||
      searchParams.get("cover") === "null"
        ? null
        : searchParams.get("cover");

    const fontData = await fetch(
      new URL(
        "../../../../../../public/assets/fonts/SpaceGrotesk-Regular.ttf",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer());
    const fontData2 = await fetch(
      new URL(
        "../../../../../../public/assets/fonts/SpaceGrotesk-SemiBold.ttf",
        import.meta.url
      )
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            background: "#17101f",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              letterSpacing: "-.02em",
              fontWeight: 700,
              background: "#17101f",
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                letterSpacing: "-.02em",
                fontWeight: 700,
                background: "#FFF",
                borderRadius: 12,
                overflow: "hidden",
                border: "2px solid #4c3a4ec0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "12px",
                  borderBottom: "2px solid #4c3a4ec0",
                  overflow: "hidden",
                  height: "70%",
                  position: "relative",
                }}
              >
                {cover && (
                  <img
                    src={cover}
                    alt="cover"
                    width={580}
                    height={400}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                )}

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "120%",
                    height: "120%",
                    background:
                      "linear-gradient(180deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.1))",
                  }}
                />
                {logoA0X && (
                  <img
                    src={logoA0X}
                    alt="logo"
                    width={48}
                    height={48}
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 20,
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  background: "#000",
                  height: "30%",
                  padding: "12px 40px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 24,
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    Chat with an A0X Agent
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 24,
                      color: "#fff",
                      fontWeight: 500,
                      gap: 8,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {pfpAgent && (
                      <img
                        src={pfpAgent}
                        alt="pfp"
                        width={48}
                        height={48}
                        style={{ borderRadius: "50%" }}
                      />
                    )}
                    @{handle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 400,
        fonts: [
          {
            name: "SpaceGrotesk",
            data: fontData,
            style: "normal",
            weight: 500,
          },
          {
            name: "SpaceGrotesk",
            data: fontData2,
            style: "normal",
            weight: 600,
          },
        ],
      }
    );
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
