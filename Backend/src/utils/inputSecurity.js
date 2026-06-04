const HTML_TAG_PATTERN = /<[^>]+>/;

const assertNoHtml = (value, fieldName) => {
    if (typeof value === "string" && HTML_TAG_PATTERN.test(value)) {
        throw new Error(`${fieldName} cannot contain HTML or script content.`);
    }
};

const normalizeString = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    return value.trim().replace(/\s+/g, " ");
};

const normalizeEmail = (email) => {
    if (typeof email !== "string") {
        return email;
    }

    return email.trim().toLowerCase();
};

const normalizeUrl = (value, fieldName) => {
    if (!value) {
        return "";
    }

    const rawValue = typeof value === "string" ? value.trim() : "";
    const normalizedValue = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

    let parsedUrl;

    try {
        parsedUrl = new URL(normalizedValue);
    } catch {
        throw new Error(`${fieldName} must be a valid URL.`);
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error(`${fieldName} must use http or https.`);
    }

    return parsedUrl.toString();
};

export const normalizeUserInput = ({ name, email, profilePicture }) => {
    assertNoHtml(name, "Name");
    assertNoHtml(email, "Email");

    return {
        name: normalizeString(name),
        email: normalizeEmail(email),
        profilePicture: profilePicture ? normalizeUrl(profilePicture, "Profile picture") : "",
    };
};

export const normalizeProfileUpdateInput = ({ name, email, profilePicture }) => {
    assertNoHtml(name, "Name");
    assertNoHtml(email, "Email");

    const normalizedData = {};

    if (typeof name !== "undefined") {
        normalizedData.name = normalizeString(name);
    }

    if (typeof email !== "undefined") {
        normalizedData.email = normalizeEmail(email);
    }

    if (typeof profilePicture !== "undefined") {
        normalizedData.profilePicture = profilePicture
            ? normalizeUrl(profilePicture, "Profile picture")
            : "";
    }

    return normalizedData;
};

export const normalizeTaskInput = (taskData) => {
    const normalizedTask = {
        ...taskData,
    };

    if (typeof taskData.title !== "undefined") {
        assertNoHtml(taskData.title, "Title");
        normalizedTask.title = normalizeString(taskData.title);
    }

    if (typeof taskData.description !== "undefined") {
        assertNoHtml(taskData.description, "Description");
        normalizedTask.description = normalizeString(taskData.description);
    }

    if (Array.isArray(taskData.attachments)) {
        normalizedTask.attachments = taskData.attachments.map((attachment, index) =>
            normalizeUrl(attachment, `Attachment ${index + 1}`));
    }

    if (Array.isArray(taskData.todoChecklist)) {
        normalizedTask.todoChecklist = taskData.todoChecklist.map((item) => {
            if (typeof item === "string") {
                assertNoHtml(item, "Todo item");
                return normalizeString(item);
            }

            assertNoHtml(item?.text, "Todo item");
            return {
                ...item,
                text: normalizeString(item?.text),
            };
        });
    }

    return normalizedTask;
};
