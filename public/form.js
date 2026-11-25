// Client-side validation for registrationform.html
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const success = document.getElementById("formSuccess");

    const errorFor = (name) => form.querySelector(`.field-error[data-for="${name}"]`);

    function setError(name, message) {
        const err = errorFor(name);
        const field = form.elements[name];
        if (err) {
            if (message) err.textContent = message;
            err.classList.add("show");
        }
        if (field && field.classList) field.classList.add("invalid");
    }

    function clearError(name) {
        const err = errorFor(name);
        const field = form.elements[name];
        if (err) err.classList.remove("show");
        if (field && field.classList) field.classList.remove("invalid");
    }

    // Each rule returns true when the field is valid
    const rules = {
        name: () => form.name.value.trim().length >= 2,
        email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()),
        password: () => form.password.value.length >= 8,
        confirmPassword: () => form.confirmPassword.value !== "" && form.confirmPassword.value === form.password.value,
        dob: () => {
            const v = form.dob.value;
            if (!v) return false;
            const d = new Date(v);
            return !isNaN(d) && d <= new Date() && d.getFullYear() >= 1900;
        },
        role: () => form.role.value !== "",
        gender: () => !!form.querySelector('input[name="gender"]:checked'),
        terms: () => form.terms.checked
    };

    function validateField(name) {
        const ok = rules[name]();
        ok ? clearError(name) : setError(name);
        return ok;
    }

    // Live feedback after the user leaves / changes a field
    Object.keys(rules).forEach((name) => {
        const els = form.querySelectorAll(`[name="${name}"]`);
        els.forEach((el) => {
            el.addEventListener("blur", () => {
                if (el.type !== "radio" && el.type !== "checkbox") validateField(name);
            });
            el.addEventListener("change", () => validateField(name));
            el.addEventListener("input", () => {
                if (errorFor(name)?.classList.contains("show")) validateField(name);
                if (name === "password" && form.confirmPassword.value) validateField("confirmPassword");
            });
        });
    });

    // Show / hide password buttons
    form.querySelectorAll(".toggle-password").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            btn.textContent = show ? "Hide" : "Show";
            btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        success.classList.remove("show");

        const results = Object.keys(rules).map(validateField);
        if (results.includes(false)) {
            const firstBad = form.querySelector(".invalid, .field-error.show");
            if (firstBad) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        // Demo only: no server stores this registration.
        const name = form.name.value.trim();
        success.textContent = `Thank you, ${name}! Your registration was received.`;
        success.classList.add("show");
        form.reset();
    });
});
