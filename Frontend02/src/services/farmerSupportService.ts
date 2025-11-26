import api from './api';

export interface SupportTicket {
  _id?: string;
  issueType: string;
  subject: string;
  message: string;
  attachments?: string[];
  status: 'open' | 'in_progress' | 'closed';
  responses?: Array<{
    message: string;
    respondedBy: string;
    respondedAt: string;
  }>;
  createdAt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const farmerSupportService = {
  // Create support ticket
  async createTicket(data: FormData) {
    try {
      const response = await api.post('/farmer/support/ticket', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  },

  // Get all support tickets
  async getTickets() {
    try {
      const response = await api.get('/farmer/support/tickets');
      return response.data;
    } catch (error) {
      console.error('Get tickets error:', error);
      throw error;
    }
  },

  // Get single ticket
  async getTicketById(id: string) {
    try {
      const response = await api.get(`/farmer/support/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get ticket error:', error);
      throw error;
    }
  },

  // Update ticket
  async updateTicket(id: string, message: string) {
    try {
      const response = await api.put(`/farmer/support/tickets/${id}`, { message });
      return response.data;
    } catch (error) {
      console.error('Update ticket error:', error);
      throw error;
    }
  },

  // Get FAQs
  async getFAQs() {
    try {
      const response = await api.get('/farmer/support/faq');
      return response.data;
    } catch (error) {
      console.error('Get FAQs error:', error);
      // Return mock FAQs if API fails
      return {
        success: true,
        data: [
          {
            id: '1',
            question: 'How do I add products to sell?',
            answer: 'Go to Dashboard > Sell Product, fill in the product details, upload images, and submit for approval.',
            category: 'Products',
          },
          {
            id: '2',
            question: 'How long does product approval take?',
            answer: 'Product approval typically takes 24-48 hours. You will be notified once your product is approved.',
            category: 'Products',
          },
          {
            id: '3',
            question: 'How do I track orders?',
            answer: 'You can track all orders in Dashboard > Orders Received section.',
            category: 'Orders',
          },
          {
            id: '4',
            question: 'When will I receive payment?',
            answer: 'Payments are processed within 7 days of order delivery to your linked bank account.',
            category: 'Payments',
          },
          {
            id: '5',
            question: 'Can I edit my product after submission?',
            answer: 'Yes, you can edit products that are pending or approved from the Sell Product page.',
            category: 'Products',
          },
        ],
      };
    }
  },
};
