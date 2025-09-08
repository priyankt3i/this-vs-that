
const errorTemplates = [
    {
        title: "Apples and Oranges Alert!",
        subtext: "To compare fairly, please pick two items from the same fruit bowl (category)."
    },
    {
        title: "This comparison is bananas.",
        subtext: "We can't compare a [Product Type A] to a [Product Type B]. Please select two similar products."
    },
    {
        title: "You're comparing chalk and cheese.",
        subtext: "These items have nothing in common. Try selecting two types of cheese instead."
    },
    {
        title: "That’s like comparing a fish to a bicycle.",
        subtext: "One swims, one rolls. Please select two items that share a purpose."
    },
    {
        title: "Does not compute. Comparing [Product Type A] to [Product Type B] has caused a logic error in sector 7.",
        subtext: "Please select items from the same category to restore order to the universe (and our servers)."
    },
    {
        title: "Category Mismatch: Our comparison engine tried to divide by zero and got very flustered.",
        subtext: "Please choose two items we can actually compare without breaking math."
    },
    {
        title: "We're trying to find common specs between a laptop and a toaster, but we keep getting crumbs in the USB port.",
        subtext: "Select products from the same category for a cleaner comparison."
    },
    {
        title: "404: Common ground not found.",
        subtext: "These products exist in entirely different worlds. Please select two products from the same category."
    },
    {
        title: "One of these things is not like the other...",
        subtext: "In fact, they're not alike at all. Please choose two items from the same product type to continue."
    },
    {
        title: "Interesting choice. Are you trying to decide if the [Product Type A] or the [Product Type B] will look better on your bookshelf?",
        subtext: "For a feature-by-feature breakdown, please select comparable items."
    }
];

export const getRandomMismatchError = (categoryA: string, categoryB: string): string => {
    const randomIndex = Math.floor(Math.random() * errorTemplates.length);
    const template = errorTemplates[randomIndex];

    const finalTitle = template.title
        .replace(/\[Product Type A\]/g, categoryA)
        .replace(/\[Product Type B\]/g, categoryB);

    const finalSubtext = template.subtext
        .replace(/\[Product Type A\]/g, categoryA)
        .replace(/\[Product Type B\]/g, categoryB);

    return `${finalTitle}\n${finalSubtext}`;
};
