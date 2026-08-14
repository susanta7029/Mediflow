-- MEDIFLOW Database Migration V2: Clean Production Seed Data
-- Default password for system accounts: Password123!
-- Verified BCrypt hash for "Password123!": $2a$10$EhONVGoy0ICtLCzdo790R.9UEdv2TzzoNa50lDqE69sAo.MxYMvT2

-- Medical Departments
INSERT INTO departments (id, name, code, description, is_active) VALUES
(1, 'Cardiology', 'CARD', 'Comprehensive cardiovascular diagnosis, heart disease management, and cardiac care.', TRUE),
(2, 'Neurology', 'NEUR', 'Advanced brain, spinal cord, and nerve disorder treatment.', TRUE),
(3, 'Pediatrics', 'PED', 'Specialized medical care for infants, children, and adolescents.', TRUE),
(4, 'Orthopedics', 'ORTH', 'Bone, joint, ligament, tendon, and muscular healthcare.', TRUE),
(5, 'General Medicine', 'GEN', 'Primary care, diagnostic evaluation, and routine healthcare consultations.', TRUE);

-- System Staff Users (1: Admin, 2: Receptionist)
INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, role, is_active) VALUES
(1, 'admin@mediflow.com', '$2a$10$EhONVGoy0ICtLCzdo790R.9UEdv2TzzoNa50lDqE69sAo.MxYMvT2', 'System', 'Admin', '+1-555-0101', 'ADMIN', TRUE),
(2, 'reception@mediflow.com', '$2a$10$EhONVGoy0ICtLCzdo790R.9UEdv2TzzoNa50lDqE69sAo.MxYMvT2', 'Sarah', 'Jenkins', '+1-555-0303', 'RECEPTIONIST', TRUE);

-- Audit Log for System Initialization
INSERT INTO audit_logs (id, user_id, user_email, action, resource_type, resource_id, details, ip_address) VALUES
(1, 1, 'admin@mediflow.com', 'SYSTEM_INITIALIZATION', 'SYSTEM', '1', 'MEDIFLOW Platform initialized cleanly. Ready for real user registration.', '127.0.0.1');

-- Reset sequences for future auto-increment inserts
ALTER TABLE users ALTER COLUMN id RESTART WITH 10;
ALTER TABLE departments ALTER COLUMN id RESTART WITH 10;
ALTER TABLE doctors ALTER COLUMN id RESTART WITH 10;
ALTER TABLE patients ALTER COLUMN id RESTART WITH 10;
ALTER TABLE appointments ALTER COLUMN id RESTART WITH 10;
ALTER TABLE queue_entries ALTER COLUMN id RESTART WITH 10;
ALTER TABLE consultations ALTER COLUMN id RESTART WITH 10;
ALTER TABLE prescriptions ALTER COLUMN id RESTART WITH 10;
ALTER TABLE prescription_items ALTER COLUMN id RESTART WITH 10;
ALTER TABLE invoices ALTER COLUMN id RESTART WITH 10;
ALTER TABLE invoice_items ALTER COLUMN id RESTART WITH 10;
ALTER TABLE notifications ALTER COLUMN id RESTART WITH 10;
ALTER TABLE audit_logs ALTER COLUMN id RESTART WITH 10;
