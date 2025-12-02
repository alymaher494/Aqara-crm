export function useToast() {
  return {
    toast: ({ title, description, variant }) => {
      // هنا ممكن تحط Toast UI حقيقي
      console.log(`[${variant || 'info'}] ${title}: ${description}`);
    }
  };
} 