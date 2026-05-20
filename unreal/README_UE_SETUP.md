# Unreal Engine 5 Setup Guide — Fashion Platform Live Try-On

This guide is for the 3D developer to connect the Unreal Engine 5.3 scene with the Web Application's real-time try-on bridge.

## 1. Setup the Scene & Avatars

1. Open your UE5.3 project.
2. Enable the **Pixel Streaming** plugin (requires editor restart).
3. Import your 5 high-fidelity MetaHuman characters from Quixel Bridge.
4. Place all 5 MetaHuman Blueprints in the level:
   - Assign the Actor Tags or Blueprint variables to match:
     - `BP_Avatar_01`
     - `BP_Avatar_02`
     - `BP_Avatar_03`
     - `BP_Avatar_04`
     - `BP_Avatar_05`
5. By default, check **Actor Hidden In Game** for all 5 characters in the editor Details panel so they start invisible.

## 2. Create the PS Manager BP

1. Create a new Actor Blueprint named `BP_PSManager` and place it in the level.
2. Inside `BP_PSManager`'s **Event Graph**:
   - On **BeginPlay**:
     - Get the **Pixel Streaming Input Component**.
     - Call **Bind Event to On Input Event** with a custom event, e.g. `OnWebCommandReceived`.
3. In `OnWebCommandReceived` (takes `FString` JSONString):
   - Use the **Json Blueprint Utilities** plugin (or simple string parsing) to parse the payload:
     - `action` (string)
     - `metahuman_id` (string)
     - `skm_asset_key` (string)
   - If `action` equals `"SWITCH_OUTFIT"`:
     - Run a function to hide all avatars (set **Actor Hidden In Game** to true).
     - Find the avatar whose tag/name matches the parsed `metahuman_id` and show it (set **Actor Hidden In Game** to false).
     - Dynamically load the Skeletal Mesh matching the `skm_asset_key` from `/Game/Outfits/`.
     - Assign this mesh to the active MetaHuman's torso/body skeletal mesh component using the **Set Skeletal Mesh** node.

## 3. Outfit Mesh Conventions

Import all 3D clothing items as Skeletal Meshes inside `/Game/Outfits/` and name them exactly like the `skm_asset_key` in the database seed:
- `outfit_zara_white_tee`
- `outfit_zara_denim_jacket`
- `outfit_gucci_floral_suit`
- `outfit_hm_evening_gown`
- `outfit_nike_tech_hoodie`
- `outfit_versace_baroque_blz`

## 4. Run the Signaling Server & Game

1. Start the Pixel Streaming Signalling Server on port 8888 (the default signaling server provided in UE5's engine folder under `Engine/Source/Programs/PixelStreaming/WebServers/SignallingWebServer`).
2. Package your game or run it in Standalone mode with the command line parameters:
   ```bash
   ./FashionPlatform.exe -PixelStreamingURL=ws://localhost:8888 -RenderOffScreen -Unattended
   ```
3. The Node.js backend's `psbridge.ts` will connect to `ws://localhost:8888` and automatically relay outfit-switching commands triggered by users on the web app!
