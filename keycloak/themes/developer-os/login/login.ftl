<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        Access your command center
    <#elseif section = "form">
    <div class="flex flex-col gap-5">
        <#if realm.password>
            <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" class="space-y-4">
                <#if !usernameHidden??>
                    <div class="space-y-2">
                        <label for="username" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100"><#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if></label>

                        <input tabindex="1" id="username" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="username" value="${(login.username!'')}"  type="text" autofocus autocomplete="off"
                               aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                               placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>"
                        />

                        <#if messagesPerField.existsError('username','password')>
                            <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                            </span>
                        </#if>
                    </div>
                </#if>

                <div class="space-y-2">
                    <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("password")}</label>

                    <input tabindex="2" id="password" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="password" type="password" autocomplete="off"
                           aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                           placeholder="••••••••"
                    />

                    <#if usernameHidden?? && messagesPerField.existsError('username','password')>
                        <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                        </span>
                    </#if>
                </div>

                <div class="flex items-center justify-between mt-2 pt-2">
                    <#if realm.rememberMe && !usernameHidden??>
                        <div class="flex items-center space-x-2">
                            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" class="h-4 w-4 rounded border-zinc-800 text-zinc-50 focus:ring-zinc-300 focus:ring-offset-zinc-950 bg-zinc-950 accent-zinc-50" <#if login.rememberMe??>checked</#if>>
                            <label for="rememberMe" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">${msg("rememberMe")}</label>
                        </div>
                    </#if>
                    <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors">${msg("doForgotPassword")}</a>
                    </#if>
                </div>

                <div class="pt-4">
                    <input tabindex="4" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90 cursor-pointer" name="login" id="kc-login" type="submit" value="${msg("doLogIn")}"/>
                </div>
            </form>
        </#if>
    </div>
    <#elseif section = "info" >
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
            <div class="text-sm text-zinc-400">
                ${msg("noAccount")} <a tabindex="6" href="${url.registrationUrl}" class="font-medium text-zinc-50 hover:underline underline-offset-4">${msg("doRegister")}</a>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
