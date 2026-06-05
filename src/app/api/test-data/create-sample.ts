import { sql } from '@vercel/postgres'

export async function createSampleData() {
  // Create a sample customer
  const customer = await sql`
    INSERT INTO customers (name, email, phone, address, created_at)
    VALUES ('John Smith', 'john.smith@example.com', '555-1234', '123 Oak Street', NOW())
    RETURNING id, name, email
  `
  
  const customerId = customer.rows[0].id
  
  // Create a sample job
  const job = await sql`
    INSERT INTO jobs (customer_id, title, description, status, scheduled_date, price, created_at)
    VALUES (${customerId}, 'Lawn Mowing & Edging', 'Weekly lawn care service', 'pending', NOW(), 49.00, NOW())
    RETURNING id, title, status, price
  `
  
  // Create a sample invoice
  const invoice = await sql`
    INSERT INTO invoices (customer_id, job_id, title, amount, status, due_date, created_at)
    VALUES (${customerId}, ${job.rows[0].id}, 'Invoice #001', 49.00, 'pending', NOW() + 30, NOW())
    RETURNING id, title, amount, status
  `
  
  return {
    customer: customer.rows[0],
    job: job.rows[0],
    invoice: invoice.rows[0]
  }
}
