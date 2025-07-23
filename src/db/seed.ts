import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { rolesTable, userRolesTable } from './rolesSchema';
import { permissionsTable, rolePermissionsTable } from './permissionsSchema';
import { supabase } from '../config/supabase';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const seedDatabase = async () => {
  const adminEmail = 'admin@admin.com';
  const adminPassword = 'admin';

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', adminEmail)
    .single();

  let adminId: string;

  if (!existingUser) {
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    adminId = user!.id;

    await supabase.from('users').insert({
      id: adminId,
      email: adminEmail,
      name: 'Admin User',
    });
  } else {
    adminId = existingUser.id;
  }

  const queryClient = postgres(process.env.DATABASE_URL!);
  const db = drizzle(queryClient);

  const rolesList = [
    { id: randomUUID(), name: 'admin', description: 'Administrator with full access' },
    { id: randomUUID(), name: 'seller', description: 'Can manage their own products' },
    { id: randomUUID(), name: 'customer', description: 'Regular customer' },
  ];

  for (const role of rolesList) {
    const existingRole = await db.select().from(rolesTable).where(eq(rolesTable.name, role.name));
    if (existingRole.length === 0) {
      await db.insert(rolesTable).values(role);
    }
  }

  const permissionsList = [
    { id: randomUUID(), name: 'manage:all', description: 'Full system access' },
    { id: randomUUID(), name: 'create:product', description: 'Can create products' },
    { id: randomUUID(), name: 'update:product', description: 'Can update products' },
    { id: randomUUID(), name: 'delete:product', description: 'Can delete products' },
    { id: randomUUID(), name: 'read:product', description: 'Can view products' },
    { id: randomUUID(), name: 'manage:orders', description: 'Can manage orders' },
  ];

  for (const permission of permissionsList) {
    const existingPermission = await db
      .select()
      .from(permissionsTable)
      .where(eq(permissionsTable.name, permission.name));
    if (existingPermission.length === 0) {
      await db.insert(permissionsTable).values(permission);
    }
  }

  const allRoles = await db.select().from(rolesTable);
  const allPermissions = await db.select().from(permissionsTable);

  const adminRole = allRoles.find((r) => r.name === 'admin');
  const sellerRole = allRoles.find((r) => r.name === 'seller');
  const customerRole = allRoles.find((r) => r.name === 'customer');

  if (adminRole) {
    for (const permission of allPermissions) {
      await db
        .insert(rolePermissionsTable)
        .values({ roleId: adminRole.id, permissionId: permission.id })
        .onConflictDoNothing();
    }
  }

  if (sellerRole) {
    const sellerPermissions = allPermissions.filter((p) =>
      [
        'create:product',
        'update:product',
        'delete:product',
        'read:product',
        'manage:orders',
      ].includes(p.name),
    );

    for (const permission of sellerPermissions) {
      await db
        .insert(rolePermissionsTable)
        .values({ roleId: sellerRole.id, permissionId: permission.id })
        .onConflictDoNothing();
    }
  }

  if (customerRole) {
    const readProductPerm = allPermissions.find((p) => p.name === 'read:product');
    if (readProductPerm) {
      await db
        .insert(rolePermissionsTable)
        .values({ roleId: customerRole.id, permissionId: readProductPerm.id })
        .onConflictDoNothing();
    }
  }

  for (const role of allRoles) {
    await db
      .insert(userRolesTable)
      .values({ userId: adminId, roleId: role.id })
      .onConflictDoNothing();
  }

  console.log('Seeding completed successfully!');
  await queryClient.end();
};

seedDatabase().catch(console.error);
