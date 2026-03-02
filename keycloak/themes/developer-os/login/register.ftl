<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        Create a new account
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post" class="space-y-4">
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label for="firstName" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("firstName")}</label>
                    <input type="text" id="firstName" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="firstName" value="${(register.formData.firstName!'')}"
                           aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                           placeholder="John"
                    />
                    <#if messagesPerField.existsError('firstName')>
                        <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                        </span>
                    </#if>
                </div>

                <div class="space-y-2">
                    <label for="lastName" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("lastName")}</label>
                    <input type="text" id="lastName" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="lastName" value="${(register.formData.lastName!'')}"
                           aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                           placeholder="Doe"
                    />
                    <#if messagesPerField.existsError('lastName')>
                        <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <div class="space-y-2">
                <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("email")}</label>
                <input type="text" id="email" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="email" value="${(register.formData.email!'')}" autocomplete="email"
                       aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                       placeholder="m@example.com"
                />
                <#if messagesPerField.existsError('email')>
                    <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <div class="space-y-2">
                    <label for="username" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("username")}</label>
                    <input type="text" id="username" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="username" value="${(register.formData.username!'')}" autocomplete="username"
                           aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                           placeholder="johndoe"
                    />
                    <#if messagesPerField.existsError('username')>
                        <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#if passwordRequired ?? && passwordRequired>
                <div class="space-y-2">
                    <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("password")}</label>
                    <input type="password" id="password" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="password" autocomplete="new-password"
                           aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                           placeholder="••••••••"
                    />
                    <#if messagesPerField.existsError('password')>
                        <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                        </span>
                    </#if>
                </div>

                <div class="space-y-2">
                    <label for="password-confirm" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-100">${msg("passwordConfirm")}</label>
                    <input type="password" id="password-confirm" class="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ring-offset-zinc-950 transition-colors" name="password-confirm"
                           aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                           placeholder="••••••••"
                    />
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="text-[0.8rem] font-medium text-red-500" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#if recaptchaRequired??>
                <div class="form-group">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <div class="pt-4 space-y-4">
                <input class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-zinc-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90 cursor-pointer" type="submit" value="${msg("doRegister")}"/>
                
                <div class="text-center">
                    <a href="${url.loginUrl}" class="text-sm font-medium text-zinc-400 hover:text-zinc-50 transition-colors">${kcSanitize(msg("backToLogin"))?no_esc}</a>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
