// background.unit.test.js
// Unit tests for background.js utility functions

const { sanitizeFilename, toMarkdown } = require("../background.js");

describe("sanitizeFilename", () => {
    it("should lowercase and replace non-alphanumerics with dashes", () => {
        expect(sanitizeFilename("Hello World!")).toBe("hello-world");
        expect(sanitizeFilename("2025/06/01:Test")).toBe("2025-06-01-test");
        expect(sanitizeFilename("  Spaces  ")).toBe("spaces");
        expect(sanitizeFilename("A@B#C$")).toBe("a-b-c");
    });

    describe("sanitizeFilename edge cases", () => {
        it("should return empty string for empty input", () => {
            expect(sanitizeFilename("")).toBe("");
        });
        it("should return empty string for only special characters", () => {
            expect(sanitizeFilename("@#$%^&*")).toBe("");
        });
        it("should trim leading/trailing dashes after replacement", () => {
            expect(sanitizeFilename("--Hello--World--")).toBe("hello-world");
            expect(sanitizeFilename("---Test---")).toBe("test");
        });
    });
});

describe("toMarkdown", () => {
    it("should format front matter and quote text", () => {
        const data = {
            date: "2025-06-01",
            title: "Test Title",
            cited: "Author",
            link: "https://example.com",
            seo: "desc",
            tags: "tag1,tag2",
            text: "Line 1\nLine 2",
        };
        const md = toMarkdown(data);
        expect(md).toContain("---");
        expect(md).toContain("date: 2025-06-01");
        expect(md).toContain('title: "Test Title"');
        expect(md).toContain("> Line 1");
        expect(md).toContain("> Line 2");
    });

    describe("toMarkdown edge cases", () => {
        it("should handle missing fields gracefully", () => {
            const data = { date: "2025-06-01", text: "" };
            const md = toMarkdown(data);
            expect(md).toContain("date: 2025-06-01");
            expect(md).toContain('title: ""');
            expect(md).toContain('cited: ""');
            expect(md).toContain("link: undefined");
            expect(md).toContain('seo: ""');
            expect(md).toContain("tags: ");
        });
        it("should handle multiline and empty text", () => {
            const data = {
                date: "2025-06-01",
                title: "",
                cited: "",
                link: "",
                seo: "",
                tags: "",
                text: "First line\n\nSecond line",
            };
            const md = toMarkdown(data);
            expect(md).toContain("> First line");
            expect(md).toContain("> "); // for empty line
            expect(md).toContain("> Second line");
        });
        it("should handle special characters in fields", () => {
            const data = {
                date: "2025-06-01",
                title: "T!@#itle$%^",
                cited: "A*&^uthor",
                link: "https://ex.com/?a=1&b=2",
                seo: "desc<>?",
                tags: "t@#ag1,t$%^ag2",
                text: "Special > chars",
            };
            const md = toMarkdown(data);
            expect(md).toContain('title: "T!@#itle$%^"');
            expect(md).toContain('cited: "A*&^uthor"');
            expect(md).toContain("link: https://ex.com/?a=1&b=2");
            expect(md).toContain('seo: "desc<>?"');
            expect(md).toContain("tags: t@#ag1,t$%^ag2");
            expect(md).toContain("> Special > chars");
        });
    });
});
