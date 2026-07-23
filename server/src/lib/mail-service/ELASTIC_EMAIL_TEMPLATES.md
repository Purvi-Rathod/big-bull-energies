# Email templates (legacy note)

Transactional emails are now rendered **in the repository** as branded HTML
(`server/src/lib/mail-service/templates/`) and sent via Elastic Email `bodyHtml`.

You no longer need to create merge templates (`SignupWelcome`, `PasswordReset`, …)
in the Elastic Email dashboard for these flows to work.

See **EMAIL_SETUP.md** for environment variables and the admin test endpoint.

Dashboard templates remain optional only if you call the deprecated `sendWithTemplate` helper directly.
