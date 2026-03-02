<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html class="dark">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <#-- Inject our custom Developer OS styles properties -->
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
</head>

<body class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans antialiased text-zinc-50">
    
    <#-- The main centered login box mimicking the Shadcn Card -->
    <div class="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden mt-8 mb-8">
        
        <#-- Logo / Header section -->
        <div class="px-8 pt-8 pb-6 text-center border-b border-zinc-900/50">
            <div class="flex items-center justify-center gap-3 mb-4">
                <div class="w-10 h-10 bg-zinc-100 text-zinc-950 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                    OS
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-white">Developer OS</h1>
            </div>
            <p class="text-zinc-400 text-sm">
                <#nested "header">
            </p>
        </div>

        <#-- Form Injection Point -->
        <div class="px-8 py-6">
            
            <#-- Alerts (Invalid password, etc) -->
            <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <div class="mb-6 p-4 rounded-lg text-sm border font-medium ${message.type?switch('success', 'bg-green-500/10 text-green-500 border-green-500/20', 'warning', 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', 'error', 'bg-red-500/10 text-red-500 border-red-500/20', 'bg-blue-500/10 text-blue-500 border-blue-500/20')}">
                    <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                </div>
            </#if>

            <#nested "form">
        </div>

        <#-- Bottom Info / Registration Block -->
        <#if displayInfo>
            <div class="px-8 py-6 bg-zinc-900/30 border-t border-zinc-800/50 text-center">
                <#nested "info">
            </div>
        </#if>

    </div>
    
    <div class="text-zinc-500 text-sm mt-4 text-center">
        Secure authentication via Keycloak
    </div>

</body>
</html>
</#macro>
