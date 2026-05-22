# Graph Report - /Users/apple/code/Projects/gpt_image_playground  (2026-05-22)

## Corpus Check
- 86 files · ~221,629 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 828 nodes · 1976 edges · 52 communities (39 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_APIMart API Integration|APIMart API Integration]]
- [[_COMMUNITY_Canvas & Viewport Transforms|Canvas & Viewport Transforms]]
- [[_COMMUNITY_App State & Task Management|App State & Task Management]]
- [[_COMMUNITY_Size & Ratio Configuration|Size & Ratio Configuration]]
- [[_COMMUNITY_Prompt Image Mentions|Prompt Image Mentions]]
- [[_COMMUNITY_UI Icon Components|UI Icon Components]]
- [[_COMMUNITY_Mask Processing & Validation|Mask Processing & Validation]]
- [[_COMMUNITY_Modal Components|Modal Components]]
- [[_COMMUNITY_Dev Proxy & Docker Config|Dev Proxy & Docker Config]]
- [[_COMMUNITY_Task Persistence & Recovery|Task Persistence & Recovery]]
- [[_COMMUNITY_API Profile Management|API Profile Management]]
- [[_COMMUNITY_Multi-Provider Type System|Multi-Provider Type System]]
- [[_COMMUNITY_IndexedDB Image Storage|IndexedDB Image Storage]]
- [[_COMMUNITY_Lightbox & Clipboard|Lightbox & Clipboard]]
- [[_COMMUNITY_Task Execution Pipeline|Task Execution Pipeline]]
- [[_COMMUNITY_Mock API Server|Mock API Server]]
- [[_COMMUNITY_URL Settings & Profiles|URL Settings & Profiles]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Header & Version Check|Header & Version Check]]
- [[_COMMUNITY_Custom Provider Normalization|Custom Provider Normalization]]
- [[_COMMUNITY_Settings Normalization|Settings Normalization]]
- [[_COMMUNITY_Default Profile Creation|Default Profile Creation]]
- [[_COMMUNITY_Build Dependencies|Build Dependencies]]
- [[_COMMUNITY_Image Deduplication & Hashing|Image Deduplication & Hashing]]
- [[_COMMUNITY_Profile Provider Switching|Profile Provider Switching]]
- [[_COMMUNITY_Image File Handling|Image File Handling]]
- [[_COMMUNITY_App Shell Components|App Shell Components]]
- [[_COMMUNITY_API Architecture Concepts|API Architecture Concepts]]
- [[_COMMUNITY_Test Mocks & Defaults|Test Mocks & Defaults]]
- [[_COMMUNITY_Settings UI & Drag Patterns|Settings UI & Drag Patterns]]
- [[_COMMUNITY_Deployment & CICD|Deployment & CI/CD]]
- [[_COMMUNITY_NPM Scripts|NPM Scripts]]
- [[_COMMUNITY_PWA & Viewport Guards|PWA & Viewport Guards]]
- [[_COMMUNITY_Provider Documentation|Provider Documentation]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Package Manifest|Package Manifest]]
- [[_COMMUNITY_Vercel Configuration|Vercel Configuration]]
- [[_COMMUNITY_PWA & HTML Entry|PWA & HTML Entry]]
- [[_COMMUNITY_Mobile Main Screenshot|Mobile Main Screenshot]]
- [[_COMMUNITY_Mobile Selection Screenshot|Mobile Selection Screenshot]]
- [[_COMMUNITY_Desktop Main Screenshot|Desktop Main Screenshot]]
- [[_COMMUNITY_Desktop Detail Screenshot|Desktop Detail Screenshot]]
- [[_COMMUNITY_Desktop Selection Screenshot|Desktop Selection Screenshot]]
- [[_COMMUNITY_Clipboard Utilities|Clipboard Utilities]]
- [[_COMMUNITY_Atomic DB Transactions|Atomic DB Transactions]]
- [[_COMMUNITY_Mask Target Replacement|Mask Target Replacement]]
- [[_COMMUNITY_URL Params Detection|URL Params Detection]]
- [[_COMMUNITY_URL Params Cleanup|URL Params Cleanup]]
- [[_COMMUNITY_IndexedDB Open|IndexedDB Open]]
- [[_COMMUNITY_Prompt Mention Parser|Prompt Mention Parser]]
- [[_COMMUNITY_Runtime Env Reader|Runtime Env Reader]]

## God Nodes (most connected - your core abstractions)
1. `useStore` - 32 edges
2. `normalizeSettings()` - 28 edges
3. `executeTask()` - 25 edges
4. `getActiveApiProfile()` - 20 edges
5. `SettingsModal()` - 18 edges
6. `callApimartImageApi()` - 18 edges
7. `compilerOptions` - 17 edges
8. `submitTask()` - 17 edges
9. `usePreventBackgroundScroll()` - 17 edges
10. `storeImage()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Custom Provider Manifest` --semantically_similar_to--> `fal.ai`  [INFERRED] [semantically similar]
  docs/custom-provider-llm-prompt.md → README.md
- `GitHub Pages Deployment` --semantically_similar_to--> `Docker Deployment`  [INFERRED] [semantically similar]
  .github/workflows/deploy.yml → README.md
- `Vercel Deployment` --semantically_similar_to--> `GitHub Pages Deployment`  [INFERRED] [semantically similar]
  README.md → .github/workflows/deploy.yml
- `Multi-Profile API Configuration` --references--> `Custom Provider Manifest`  [INFERRED]
  README.md → docs/custom-provider-llm-prompt.md
- `loadDevProxyConfig()` --calls--> `normalizeDevProxyConfig()`  [EXTRACTED]
  vite.config.ts → src/lib/devProxy.ts

## Hyperedges (group relationships)
- **Image Generation Task Lifecycle (submit, execute, recover, display)** — src_store_ts, src_types_ts, components_task_card_tsx, components_input_bar_tsx [EXTRACTED 1.00]
- **Development Build Pipeline (Vite + PostCSS + Tailwind + TypeScript)** — vite_config_ts, postcss_config_js, tailwind_config_js, tsconfig_json [EXTRACTED 1.00]
- **Docker Deploy Runtime Config Injection Chain** — deploy_inject_api_url_sh, vite_config_ts, src_vite_env_d_ts [EXTRACTED 1.00]
- **Modal Lifecycle Pattern (close on escape, prevent scroll, tooltip dismiss)** — hooks_usecloseonescape_usecloseonescape, hooks_usepreventbackgroundscroll_usepreventbackgroundscroll, components_viewporttooltip_viewporttooltip, hooks_usetooltip_usetooltip [EXTRACTED 1.00]
- **Image Output Viewing and Editing Flow (detail -> lightbox -> mask edit -> context menu)** — components_detailmodal_detailmodal, components_lightbox_lightbox, components_maskeditormodal_maskeditormodal, components_imagecontextmenu_imagecontextmenu [EXTRACTED 1.00]
- **Drag Interaction Components (drag-select grid, drag-reorder select, drag pan lightbox/mask)** — components_taskgrid_drag_select_pattern, components_select_drag_reorder_pattern, components_lightbox_zoom_pan_pattern, components_maskeditormodal_undo_redo_pattern [INFERRED 0.85]
- **Multi-provider image API dispatch** — lib_api_callimageapi, lib_apimartimageapi_callapimartimageapi, lib_apiprofiles_apiprofile_manager [EXTRACTED 1.00]
- **Image dimension normalization across modules** — lib_size_normalizeimagesize, lib_maskpreprocess_calculatesize, lib_paramcompatibility_param_normalize [INFERRED 0.85]
- **Viewport transform and interaction math** — lib_viewporttransform_clamp, lib_viewporttransform_zoom, lib_viewporttransform_pinch [EXTRACTED 1.00]
- **Async image task polling pattern** — lib_openaicompatibleimageapi_poll_openai_compatible_image_task, lib_openaicompatibleimageapi_poll_custom_task_result, lib_falaiimageapi_get_fal_queued_image_result [INFERRED 0.90]
- **Mask validation and rendering pipeline** — lib_mask_classify_mask_alpha, lib_mask_assert_usable_mask_coverage, lib_canvasimage_validate_mask_matches_image, lib_canvasimage_create_mask_preview_data_url [INFERRED 0.90]
- **Image persistence and thumbnail lifecycle** — lib_db_store_image, lib_db_hash_data_url, lib_db_create_image_thumbnail, lib_db_get_image_thumbnail [EXTRACTED 1.00]
- **Deployment Targets** — vercel_deploy, github_pages_deploy, docker_deployment, cloudflare_workers_deploy [EXTRACTED 1.00]
- **Core Tech Stack** — react_19, typescript, vite, tailwind_css_3, zustand [EXTRACTED 1.00]
- **CI/CD Tag-triggered Workflows** — workflows_deploy_yml, workflows_docker_yml, workflows_vercel_tag_deploy_yml [EXTRACTED 1.00]

## Communities (52 total, 13 thin omitted)

### Community 0 - "APIMart API Integration"
Cohesion: 0.06
Nodes (96): APIMART_RATIO_VALUES, APIMART_SIZE_FIELD_MAP, callApimartImageApi(), createGenerationBody(), createRequestHeaders(), extractTaskImages(), getAllByPath(), getApimartQueuedImageResult() (+88 more)

### Community 1 - "Canvas & Viewport Transforms"
Cohesion: 0.06
Nodes (40): CanvasSize, DEFAULT_VIEW_TRANSFORM, getCanvasPoint(), PanGesture, PinchGesture, SliderAnchor, Tool, canvasToBlob() (+32 more)

### Community 2 - "App State & Task Management"
Cohesion: 0.07
Nodes (40): Confirm Dialog Component, Input Bar Component, Search Bar Component, Task Card Component, Async Task Recovery Pattern, Lazy Thumbnail Backfill Pipeline, apimartRecoveryTimers, AppState (+32 more)

### Community 3 - "Size & Ratio Configuration"
Cohesion: 0.08
Nodes (37): CodeIcon(), findPresetForSize(), Mode, parseSize(), Props, RATIOS, SizePickerModal(), TIERS (+29 more)

### Community 4 - "Prompt Image Mentions"
Cohesion: 0.10
Nodes (32): getBoundaryOffsetInMention(), getContentEditableBoundaryOffset(), getContentEditableCursor(), getContentEditableSelection(), getMentionTagForBoundary(), getMentionTagTextLength(), getNodeVisibleTextLength(), getVisibleOffsetBeforeNode() (+24 more)

### Community 5 - "UI Icon Components"
Cohesion: 0.10
Nodes (20): ChevronDownIcon(), CloseIcon(), DragHandleIcon(), ExportIcon(), GithubIcon(), ImportIcon(), LinkIcon(), PlusIcon() (+12 more)

### Community 6 - "Mask Processing & Validation"
Cohesion: 0.09
Nodes (31): callImageApi test suite, canvasToBlob, createMaskPreviewDataUrl, dataUrlToBlob, imageDataUrlToPngBlob, loadImage, maskDataUrlToPngBlob, Mask dimension validation and blue overlay preview generation (+23 more)

### Community 7 - "Modal Components"
Cohesion: 0.16
Nodes (18): ConfirmDialog(), renderMessage(), DetailModal(), HelpModal(), HelpModalProps, useIsMobile(), CopyIcon(), icons (+10 more)

### Community 8 - "Dev Proxy & Docker Config"
Cohesion: 0.12
Nodes (17): Docker Runtime Configuration Injection, changeOrigin, enabled, prefix, secure, target, loadDevProxyConfig(), pkg (+9 more)

### Community 9 - "Task Persistence & Recovery"
Cohesion: 0.08
Nodes (22): getPersistedState(), markInterruptedOpenAIRunningTasks(), customAsyncRunning, doneTask, falProfile, falRunning, imageA, imageB (+14 more)

### Community 10 - "API Profile Management"
Cohesion: 0.13
Nodes (22): ApiProfileProviderDraft, BUILT_IN_PROVIDER_IDS, dedupeApiProfiles(), DEFAULT_CUSTOM_PROVIDER_PATHS, DEFAULT_EDIT_FILES, DEFAULT_GENERATE_BODY, DEFAULT_OPENAI_RESULT, findEquivalentApiProfile() (+14 more)

### Community 11 - "Multi-Provider Type System"
Cohesion: 0.09
Nodes (22): Multi-Provider Image Generation Architecture, ApiProvider, BuiltInApiProvider, CustomProviderContentType, CustomProviderDefinition, CustomProviderFileMapping, CustomProviderFileSource, CustomProviderPollMapping (+14 more)

### Community 12 - "IndexedDB Image Storage"
Cohesion: 0.21
Nodes (22): clearImages(), clearTasks(), createImageThumbnail(), dbTransaction(), deleteImage(), deleteTask(), getAllImageIds(), getAllImages() (+14 more)

### Community 13 - "Lightbox & Clipboard"
Cohesion: 0.15
Nodes (15): DownloadIcon(), EditIcon(), LightboxInnerProps, copyBlobToClipboard(), copyTextToClipboard(), copyTextWithExecCommand(), getClipboardFailureMessage(), isClipboardPermissionError() (+7 more)

### Community 14 - "Task Execution Pipeline"
Cohesion: 0.14
Nodes (22): getApiProviderLabel(), getCustomProviderDefinition(), isOpenAICompatibleProvider(), clearApimartRecoveryTimer(), clearCustomRecoveryTimer(), clearFalRecoveryTimer(), clearOpenAIWatchdogTimer(), executeTask() (+14 more)

### Community 15 - "Mock API Server"
Cohesion: 0.20
Nodes (18): appendCors(), createOpenAIResponse(), createRandomShape(), getBaseUrl(), getImageUrl(), getMode(), getRequestedN(), handleApi() (+10 more)

### Community 16 - "URL Settings & Profiles"
Cohesion: 0.14
Nodes (17): activateFirstImportedProfile(), buildSettingsFromUrlParams(), clearUrlSettingParams(), createUrlProfileId(), getUrlSettingsPayload(), hasUrlSettingParams(), pickUrlSettingsPayload(), activeProfile (+9 more)

### Community 17 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, jsx, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch (+10 more)

### Community 18 - "Header & Version Check"
Cohesion: 0.20
Nodes (10): BeforeInstallPromptEvent, Header(), ViewportTooltip(), ViewportTooltipProps, useTooltip(), LatestRelease, useVersionCheck(), bus (+2 more)

### Community 19 - "Custom Provider Normalization"
Cohesion: 0.22
Nodes (16): createCustomProviderId(), isCustomProviderTemplate(), isRecord(), legacyCustomProviderToManifest(), normalizeBodyTemplate(), normalizeContentType(), normalizeCustomProviderDefinition(), normalizeFileMappings() (+8 more)

### Community 20 - "Settings Normalization"
Cohesion: 0.27
Nodes (16): getActiveApiProfile(), normalizeSettings(), putTask(), normalizeParamsForSettings(), createSettingsForApiProfile(), genId(), getApimartRecoveryProfile(), getCustomRecoveryProfile() (+8 more)

### Community 21 - "Default Profile Creation"
Cohesion: 0.16
Nodes (13): createDefaultApimartProfile(), createDefaultFalProfile(), normalizeApiProfile(), normalizeProviderDraft(), normalizeProviderDrafts(), falProfile, officialParams, officialProfile (+5 more)

### Community 22 - "Build Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript, vite (+5 more)

### Community 23 - "Image Deduplication & Hashing"
Cohesion: 0.18
Nodes (12): Content-addressed image deduplication via SHA-256 hashing, createImageThumbnail, getImageThumbnail, hashDataUrl, storeImage, orderInputImagesForMask, validateMaskTarget, getAtImageQuery (+4 more)

### Community 24 - "Profile Provider Switching"
Cohesion: 0.17
Nodes (11): switchApiProfileProvider(), current, falProfile, imported, match, merged, openaiProfile, profile (+3 more)

### Community 25 - "Image File Handling"
Cohesion: 0.26
Nodes (12): addImageFromFile(), addImageFromUrl(), blobToDataUrl(), cacheImage(), completeRecoveredApimartTask(), completeRecoveredCustomTask(), completeRecoveredFalTask(), fileToDataUrl() (+4 more)

### Community 26 - "App Shell Components"
Cohesion: 0.38
Nodes (6): SearchBar(), TaskGrid(), Toast(), useDockerApiUrlMigrationNotice(), App(), useStore

### Community 27 - "API Architecture Concepts"
Cohesion: 0.24
Nodes (11): API Proxy (/api-proxy/), Codex CLI Compatibility Mode, fal.ai, GPT Image Playground, Image Gallery & History Management, IndexedDB, OpenAI Images API (/v1/images), OpenAI Responses API (/v1/responses) (+3 more)

### Community 28 - "Test Mocks & Defaults"
Cohesion: 0.20
Nodes (9): body, fetchMock, headers, onApimartTaskEnqueued, onCustomTaskEnqueued, promise, DEFAULT_SETTINGS, falMock (+1 more)

### Community 29 - "Settings UI & Drag Patterns"
Cohesion: 0.22
Nodes (9): Checkbox(), CheckboxProps, Drag Reorder Pattern (Select), Select(), createDefaultCustomProviderForm(), Custom Provider Manifest System, SettingsModal(), Drag Selection Pattern (TaskGrid) (+1 more)

### Community 30 - "Deployment & CI/CD"
Cohesion: 0.22
Nodes (10): Cloudflare Workers Deployment, Docker Deployment, deploy/Dockerfile, GitHub Container Registry (ghcr.io), GitHub Pages Deployment, Vercel Deployment, Vercel Deploy Hook, deploy.yml (GitHub Pages) (+2 more)

### Community 31 - "NPM Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, deploy:cf, dev, mock:api, preview, test, test:watch

### Community 32 - "PWA & Viewport Guards"
Cohesion: 0.29
Nodes (4): installMobileViewportGuards(), APP_SHELL, copy, url

### Community 33 - "Provider Documentation"
Cohesion: 0.33
Nodes (7): Asynchronous Task API Pattern, Custom Provider LLM Prompt, Custom Provider Manifest, Mock Image API (docs), Mock Image API Service, Multi-Profile API Configuration, Synchronous Task API Pattern

### Community 34 - "Runtime Dependencies"
Cohesion: 0.29
Nodes (7): dependencies, @fal-ai/client, fflate, react, react-dom, zustand, Zustand

### Community 35 - "Package Manifest"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 36 - "Vercel Configuration"
Cohesion: 0.50
Nodes (3): git, deploymentEnabled, $schema

### Community 37 - "PWA & HTML Entry"
Cohesion: 0.50
Nodes (3): src/main.tsx, manifest.webmanifest (PWA), PWA Support

## Knowledge Gaps
- **229 isolated node(s):** `$schema`, `deploymentEnabled`, `enabled`, `prefix`, `target` (+224 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Zustand` connect `Runtime Dependencies` to `App State & Task Management`, `API Architecture Concepts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `GPT Image Playground` connect `API Architecture Concepts` to `Provider Documentation`, `Runtime Dependencies`, `Build Dependencies`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `useStore` connect `App Shell Components` to `Canvas & Viewport Transforms`, `App State & Task Management`, `Size & Ratio Configuration`, `Prompt Image Mentions`, `UI Icon Components`, `Modal Components`, `Task Persistence & Recovery`, `Lightbox & Clipboard`, `Header & Version Check`, `Settings UI & Drag Patterns`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `$schema`, `deploymentEnabled`, `enabled` to the rest of the system?**
  _229 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `APIMart API Integration` be split into smaller, more focused modules?**
  _Cohesion score 0.06367695593088721 - nodes in this community are weakly interconnected._
- **Should `Canvas & Viewport Transforms` be split into smaller, more focused modules?**
  _Cohesion score 0.06390977443609022 - nodes in this community are weakly interconnected._
- **Should `App State & Task Management` be split into smaller, more focused modules?**
  _Cohesion score 0.06763285024154589 - nodes in this community are weakly interconnected._