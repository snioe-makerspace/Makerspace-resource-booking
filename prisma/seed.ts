import { EBillingType, EStatus, EventStatus, Prisma, PrismaClient } from '@prisma/client';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseEnum } from '../src/lib/Enums';
import { WeekDaysEnum, type EItemSchema } from '../src/lib/schemas';
import fs from 'fs';
import type { EventSchema } from '../src/lib/schemas';

const prisma = new PrismaClient();
const supabase = createBrowserClient(
  process.env.PUBLIC_SUPABASE_URL!,
  process.env.PUBLIC_SUPABASE_ANON_KEY!
);

const queries = {
  onNewUser: [
    Prisma.sql`
			-- When a new user signs up, insert a row into public.profile 
			-- and set the user's custom claims
			CREATE or REPLACE TRIGGER on_auth_user_created
				AFTER INSERT ON auth.users
				FOR EACH ROW EXECUTE PROCEDURE onNewUser();
		`,
    Prisma.sql`
			-- When public.profile.{isnew|role|is_blacklisted} is updated, update the user's custom claims
			CREATE or REPLACE FUNCTION on_user_profile_update()
			RETURNS trigger
			LANGUAGE plpgsql
			SECURITY DEFINER SET search_path = public
			AS $$
			BEGIN
				UPDATE auth.users
				SET raw_app_meta_data = jsonb_set(
					COALESCE(raw_app_meta_data, '{}'::jsonb),
					'{custom_claims}',
					json_build_object('role', NEW.role, 'isnew', NEW.isnew, 'is_blacklisted', NEW.is_blacklisted)::jsonb,
					true
				) WHERE id = NEW.id;
				RETURN NEW;
			END;
			$$;
		`,
    Prisma.sql`
			CREATE or REPLACE TRIGGER on_profile_updated
				AFTER UPDATE OF isnew, role ON public.profile
				FOR EACH ROW
				WHEN (OLD.isnew IS DISTINCT FROM NEW.isnew
				OR OLD.role IS DISTINCT FROM NEW.role)
				EXECUTE PROCEDURE public.on_user_profile_update();
		`
  ],
  onDeleteUser: [
    Prisma.sql`
			-- When a user is deleted, delete the corresponding row in public.profile
			CREATE or REPLACE FUNCTION onDeleteUser()
			RETURNS trigger
			LANGUAGE plpgsql
			SECURITY DEFINER SET search_path = public
			AS $$
			BEGIN
				DELETE FROM public.profile WHERE id = old.id;

				-- Delete Cart
				DELETE FROM public."Cart" WHERE user_id = old.id;

				RETURN old;
			END;
			$$;
		`,
    Prisma.sql`
			-- When a user is deleted, delete the corresponding row in public.profile
			CREATE or REPLACE TRIGGER on_auth_user_deleted
				AFTER DELETE ON auth.users
				FOR EACH ROW EXECUTE PROCEDURE onDeleteUser();
		`
  ]
};

async function onNewUser(columns: { [name: string]: string }) {
  const query = `
		CREATE or REPLACE FUNCTION onNewUser()
		RETURNS trigger
		LANGUAGE plpgsql
		SECURITY DEFINER SET search_path = public
		AS $$
		BEGIN
		
		INSERT INTO public.profile (${Object.keys(columns).join(', ')})
		VALUES (${Object.values(columns).join(', ')});
		
		-- update default data from auth.users
		UPDATE public.profile SET 
			name = COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
			mobile = COALESCE(new.phone, ''),
			email = COALESCE(new.email, '')
			WHERE id = new.id;

    UPDATE auth.users
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'::jsonb),
      '{custom_claims}',
      '{"role": "user", "isnew": true, "is_blacklisted": false}',
      true
    ) WHERE id = new.id;
			
		RETURN NEW;
		END;
		$$;
	`;

  await prisma.$transaction([
    prisma.$executeRawUnsafe(query),
    ...queries.onNewUser.map((query) => prisma.$executeRaw(query))
  ]);
}

async function onDeleteUser() {
  await prisma.$transaction(queries.onDeleteUser.map((query) => prisma.$executeRaw(query)));
}

async function makeNewBucket(name: string) {
  // https://supabase.com/docs/guides/storage/security/access-control
  // https://github.com/orgs/supabase/discussions/5786#discussioncomment-2291214
  const policies = {
    select: `
			CREATE POLICY "select_${name}"
			ON storage.objects FOR SELECT
			TO authenticated
			USING ( bucket_id = '${name}');`,
    insert: `
			CREATE POLICY "insert_${name}"
			ON storage.objects FOR INSERT
			TO authenticated
			WITH CHECK (bucket_id = '${name}');`,
    update: `
			CREATE POLICY "update_${name}"
			ON storage.objects FOR UPDATE
			TO authenticated
			USING (bucket_id = '${name}');`,
    delete: `
			CREATE POLICY "delete_${name}"
			ON storage.objects FOR DELETE
			TO authenticated
			USING (bucket_id = '${name}');`,
    seed:
      // Doc: needed only in development to let seed.ts upload images
      process.env.NODE_ENV === 'production'
        ? ''
        : `
			CREATE POLICY "seed_${name}"
			ON storage.objects FOR INSERT
			TO anon
			WITH CHECK (bucket_id = '${name}');`
  };

  // We don't want to delete the bucket if it already exists
  try {
    // Create a new bucket: https://supabase.com/docs/guides/storage/buckets/creating-buckets?language=sql
    await prisma.$executeRawUnsafe(`
		INSERT INTO storage.buckets (id, name, public)
		VALUES ('${name}', '${name}', true);`);
  } catch (e) {}

  try {
    await prisma.$transaction([
      ...Object.values(policies).map((policy) => prisma.$executeRawUnsafe(policy))
    ]);
  } catch (e) {}
}

async function seedEquipments() {
  const equipments = [
    {
      id: '_iPoLfl',
      name: 'Creality 3D Printer',
      model: 'CR-10 SE',
      image: 'e6G_5Bt.png',
      description:
        'The CR-10 from Creality is a workhorse of a printer. Able to work for long periods non-stop, it is more than capable of handling large prints requiring many hours of print time. Likewise, parts, upgrades, and materials for this printer are very cost-effective and readily available.',
      eCategoriesId: 'pw2mtah'
    },
    {
      id: 'cAZ0IdL',
      name: 'ENON',
      model: 'Inverter ARC Welding Machine',
      image: 'lYXj4np.jpg',
      description: `<h4>SMOOTH ARC</h4><p>The core of any welding machine's performance is the quality of the welding arc it produces. With this welding machine, you can expect a remarkably smooth and stable arc. This is crucial for achieving clean, precise, and aesthetically pleasing welds. </p><p><br></p><h4>ADVANCED IGBT TECHNOLOGY</h4><p>The welding industry has seen a significant shift towards IGBT (Insulated Gate Bipolar Transistor) technology due to its numerous advantages. This machine harnesses the power of advanced IGBT technology, ensuring stable and efficient welding performance.</p><p><br></p><h4>IMPRESSIVE POWER</h4><p>With 8200W of power and a 220V input, this welding machine packs a punch. It provides the energy required for various welding tasks, whether you're working on thin materials or thicker pieces.</p><p><br></p><h4>WHAT'S IN THE BOX</h4><p>Along with the welding machine, your purchase includes essential accessories to enhance your welding experience, including </p><ul><li><p>A brush for cleaning, </p></li><li><p>A belt for easy transport, </p></li><li><p>A protective welding mask, </p></li><li><p>An electrode holder, and </p></li><li><p>Ground clamps.</p><p><br></p></li></ul><h4>HOT START</h4><p>Igniting the welding arc can sometimes be a challenge, especially in less than ideal conditions. The Hot Start function addresses this issue by providing a quick and easy ignition of the welding arc. This feature significantly reduces the risk of electrode sticking, ensuring a smooth start to your welding projects.</p>`,
      eCategoriesId: 'bgwbjwd'
    }
  ];

  const instances: EItemSchema[] = [
    {
      name: 'CR-10 SE - 1',
      status: EStatus.available,
      cost: 0,
      description: '',
      equipmentId: '_iPoLfl',
      billingType: EBillingType.PER_SESSION,
      availability: {
        starts: '07:00',
        ends: '16:45',
        repeat: [WeekDaysEnum.M, WeekDaysEnum.T, WeekDaysEnum.W, WeekDaysEnum.Th, WeekDaysEnum.F],
        maxOffset: 1,
        slotSize: 30
      }
    },
    {
      name: 'CR-10 SE - 2',
      status: EStatus.inUse,
      cost: 0,
      description: '',
      billingType: EBillingType.PER_SESSION,
      equipmentId: '_iPoLfl',
      availability: {
        starts: '07:00',
        ends: '16:45',
        repeat: [WeekDaysEnum.M, WeekDaysEnum.T, WeekDaysEnum.W, WeekDaysEnum.Th, WeekDaysEnum.F],
        maxOffset: 1,
        slotSize: 30
      }
    },
    {
      name: 'CR-10 SE - 3',
      status: EStatus.broken,
      billingType: EBillingType.PER_SESSION,
      cost: 0,
      description: '',
      equipmentId: '_iPoLfl',
      availability: {
        starts: '07:00',
        ends: '16:45',
        repeat: [WeekDaysEnum.M, WeekDaysEnum.T, WeekDaysEnum.W, WeekDaysEnum.Th, WeekDaysEnum.F],
        maxOffset: 1,
        slotSize: 30
      }
    },
    {
      name: 'ENON - 1',
      status: EStatus.available,
      billingType: EBillingType.PER_SESSION,
      cost: 0,
      description: '',
      equipmentId: 'cAZ0IdL',
      availability: {
        starts: '07:00',
        ends: '16:45',
        repeat: [WeekDaysEnum.M, WeekDaysEnum.T, WeekDaysEnum.W, WeekDaysEnum.Th, WeekDaysEnum.F],
        maxOffset: 1,
        slotSize: 30
      }
    }
  ];

  await supabase.storage
    .from(SupabaseEnum.EQUIPMENT)
    .upload('e6G_5Bt.png', fs.readFileSync('prisma/seed/e6G_5Bt.png'));

  await supabase.storage
    .from(SupabaseEnum.EQUIPMENT)
    .upload('lYXj4np.jpg', fs.readFileSync('prisma/seed/lYXj4np.jpg'));

  await prisma.$transaction([
    prisma.equipment.createMany({
      data: equipments
    }),
    prisma.eInstance.createMany({
      data: instances.map((instance) => ({
        ...instance,
        description: instance.description!
      }))
    })
  ]);
}

async function seedCategories() {
  const categories = [
    { id: 'pw2mtah', name: '3D Printer' },
    { id: '384ieci', name: 'CNC (Laser cutter)' },
    { id: 'bgwbjwd', name: 'Welding' },
    { id: 'wec92q8', name: 'Hand power tools' },
    { id: 'cpwp422', name: 'Hand tools' },
    { id: '233g4pc', name: 'Design station' },
    { id: 'zyyymkp', name: 'Testing equipment' },
    { id: 'ex7r4z9', name: 'PCB design' },
    { id: 'htbyq6g', name: 'Standalone power tools' }
  ];

  await prisma.$transaction([
    prisma.eCategories.deleteMany(),
    prisma.eCategories.createMany({
      data: categories
    })
  ]);
}

async function seedContentManagement() {
  const content = {
    hero: "<h1>Welcome to SNIoE Makerspace!</h1><p>Welcome to SNIoE's Makerspace, an embodiment of our commitment to STEAM education and innovation. Here, we offer a dynamic collaborative environment fostering interdisciplinary and project creation.<br><br>Our Makerspace is equipped with cutting-edge, user-friendly tools and state-of-the-art technologies, ensuring accessibility and affordability. It serves as a hub for world-class research test-beds, facilitating the creation of quality publications.<br><br>As a one-stop destination, our space fuels solutions in sustainability, green energy, intelligent building, robotics, networks, and AI. Additionally, we provide comprehensive training and workshops, ensuring efficient and safe utilization of tools and machines.</p>",
    hours: [
      {
        to: '20:00',
        day: 'Monday',
        from: '08:00'
      },
      {
        to: '20:00',
        day: 'Tuesday',
        from: '08:00'
      },
      {
        to: '20:00',
        day: 'Wednesday',
        from: '08:00'
      },
      {
        to: '20:00',
        day: 'Thursday',
        from: '08:00'
      }
    ],
    location:
      '<h1>Location and Contact</h1><p>A004, A-block, Ground floor, Shiv Nadar University, Greater Noida, Uttar Pradesh 203207</p><p></p><h2>General Queries?</h2><ul><li><p>Phone</p><ul><li><p>Reception: +91 (120)2663811</p></li><li><p>General: +91 (120)2663811</p></li></ul></li><li><p>Email</p><ul><li><p>Jhon Doe: jhon.doe@gmail.com</p></li><li><p>Jhon Dhree: jhon.dhree@gmail.com</p></li></ul></li></ul>'
  };
  await prisma.contentManagement.create({
    data: {
      pathname: '/',
      name: 'Home',
      data: content
    }
  });
}

async function seedVideos() {
  await prisma.video.createMany({
    data: [
      {
        equipmentId: '_iPoLfl',
        video: 'https://youtu.be/GvMaw-cEFR4?si=Oc_R3bUNP-zsge96'
      },
      {
        equipmentId: '_iPoLfl',
        video: 'https://www.youtube.com/watch?v=VQMXBjj7waQ'
      }
    ]
  });
}

async function seedEvents() {
  await supabase.storage
    .from(SupabaseEnum.EVENT)
    .upload('event.png', fs.readFileSync('prisma/seed/event.png'));

  const userId = '6ea966e9-3a62-4e9a-806d-2d75a925879c';

  // TODO: An error is coming here when we run npm run db`
  await prisma.$transaction([
    prisma.event.createMany({
      data: [
        {
          id: 'zWZCZVx',
          title: 'Aryan',
          previewDesc: 'lkj',
          desc: 'lkj',
          image: 'event.png',
          startTime: '2024-12-31T18:29:00Z',
          endTime: '2025-01-11T18:29:00Z',
          venue: 'lkj',
          venueLink: 'https://www.google.com',
          status: 'UPCOMING',
          createdAt: '2024-04-08T09:49:38.121Z',
          updatedAt: '2024-04-08T09:49:38.121Z',
          userId
        },
        {
          id: 'wJIsn8s',
          title: 'Lorem Ipsum',
          previewDesc: 'Lorem Ipsum',
          desc: 'Lorem Ipsum',
          image: 'event.png',
          startTime: '2024-04-06T17:13:56Z',
          endTime: '2024-04-06T17:14:02Z',
          venue: 'Lorem Ipsum',
          venueLink: '',
          status: 'UPCOMING',
          createdAt: '2024-04-06T17:14:22Z',
          updatedAt: '2024-04-06T17:14:25Z',
          userId
        },
        {
          id: 'dJKlKOp',
          title: 'Local Art Exhibition',
          previewDesc: 'Support local artists!',
          desc: 'This exhibition showcases the work of talented local creators!',
          image: 'event.png',
          startTime: '2024-04-18T18:00:00Z',
          endTime: '2024-04-18T21:00:00Z',
          venue: 'City Art Gallery',
          venueLink: 'https://cityartgallery.org/exhibitions',
          status: 'UPCOMING',
          createdAt: '2024-04-06T17:14:25Z',
          updatedAt: '2024-04-06T17:14:25Z',
          userId
        },
        {
          id: 'o1o1o1o1',
          title: 'Movie Night Under the Stars',
          previewDesc: 'Bring your blankets and snacks!',
          desc: 'Enjoy a classic film outdoors under a beautiful night sky!',
          image: 'event.png',
          startTime: '2024-04-23T20:00:00Z',
          endTime: '2024-04-24T00:00:00Z',
          venue: 'Central Park',
          venueLink: 'https://www.centralpark.com/events',
          status: 'UPCOMING',
          createdAt: '2024-04-06T17:14:25Z',
          updatedAt: '2024-04-06T17:14:25Z',
          userId
        },
        {
          id: 'IuIuIuIu',
          title: 'Live Music Performance',
          previewDesc: 'Dance the night away!',
          desc: 'Get ready for a night of music and fun with a popular band!',
          image: 'event.png',
          startTime: '2024-04-27T21:00:00Z',
          endTime: '2024-04-28T01:00:00Z',
          venue: 'The Venue Club',
          venueLink: 'https://thevenueclub.com/events',
          status: 'UPCOMING',
          createdAt: '2024-04-06T17:14:25Z',
          updatedAt: '2024-04-06T17:14:25Z',
          userId
        },
        {
          id: 'xpto3Z92',
          title: 'Book Club Meeting',
          previewDesc: 'Discussion on [Book Title Here]',
          desc: 'Join us for a lively discussion about this thought-provoking book!',
          image: 'event.png',
          startTime: '2024-04-20T14:00:00Z',
          endTime: '2024-04-20T16:00:00Z',
          venue: 'Library Auditorium',
          venueLink: 'https://www.library.com/events',
          status: 'UPCOMING',
          createdAt: '2024-04-06T17:14:25Z',
          updatedAt: '2024-04-06T17:14:25Z',
          userId
        },
        {
          id: 'n7b0uHL',
          title: 'Hello',
          previewDesc: 'Helo',
          desc: 'helo\n',
          image: 'event.png',
          startTime: '2025-04-08T15:27:00Z',
          endTime: '2024-04-10T16:32:00Z',
          venue: 'Hello',
          venueLink: '',
          status: 'UPCOMING',
          createdAt: '2024-04-08T12:28:09.602Z',
          updatedAt: '2024-04-08T12:28:09.602Z',
          userId
        }
      ]
    })
  ]);
}

async function main() {
  await seedCategories()
    .then(() => console.log('✅ eCategories seeded'))
    .catch((e) => console.error(`🚨 ${e}`));

  // Values are passed without quotes and postgresql only considers
  // single quotes as quotes and double quotes as identifiers.
  // Postgres converts all uppercase identifiers to lowercase.
  await onNewUser({
    id: 'new.id',
    role: "'user'",
    isnew: 'true',
    name: "''",
    mobile: "''",
    email: "''",
    type: "'STUDENT'",
    type_data: "'{}'"
  })
    .then(() => console.log('✅ onNewUser trigger created'))
    .catch((e) => console.error(`🚨 ${e}`));

  await onDeleteUser()
    .then(() => console.log('✅ onDeleteUser trigger created'))
    .catch((e) => console.error(`🚨 ${e}`));

  // Buckets
  await makeNewBucket(SupabaseEnum.EQUIPMENT)
    .then(() => console.log('✅ Equipments Bucket created'))
    .catch((e) => console.error(`🚨 ${e}`));
  await makeNewBucket(SupabaseEnum.MANUAL)
    .then(() => console.log('✅ Manuals Bucket created'))
    .catch((e) => console.error(`🚨 ${e}`));
  await makeNewBucket(SupabaseEnum.EVENT)
    .then(() => console.log('✅ Events Bucket created'))
    .catch((e) => console.error(`🚨 ${e}`));

  await seedContentManagement()
    .then(() => console.log('✅ Content Management seeded'))
    .catch((e) => console.error(`🚨 CMS Error`));

  if (process.env.NODE_ENV !== 'production') {
    await seedVideos()
      .then(() => console.log('✅ Videos seeded'))
      .catch((e) => console.error(`🚨 ${e}`));
    await seedEvents()
      .then(() => console.log('✅ Events seeded'))
      .catch((e) => console.error(`🚨 ${e}`));
    await seedEquipments()
      .then(() => console.log('✅ Equipments seeded'))
      .catch((e) => console.error(`🚨 ${e}`));
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
