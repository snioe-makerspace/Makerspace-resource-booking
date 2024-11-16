<script>
  // @ts-nocheck

  import { CANCELLED } from 'dns';
  import { Button, Hr, Html, Text, Section, Body, Container, Heading, Head } from 'svelte-email';

  export let name = 'World';
  export let status = 'confirmed';
  export let bookings = [];
  export let adminNotes = '';

  $: console.log(bookings.map((item) => item));
</script>

<Html lang="en">
  <Head />
  <!-- <Preview>Your booking confirmation</Preview> -->
  <Body
    style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;"
  >
    <Container
      style="background-color: #ffffff; margin: 0 auto; padding: 40px 20px; max-width: 600px;"
    >
      <Heading
        style="color: #333; text-align: center; font-size: 24px; font-weight: bold; margin: 30px 0;"
      >
        Booking Confirmation
      </Heading>
      <Text style="color: #333; font-size: 16px; line-height: 24px;">Hello, {name}!</Text>
      {#if status === 'APPROVED'}
        <Text style="color: #333; font-size: 16px; line-height: 24px;">
          Thank you for your booking! We're excited to confirm your upcoming appointments:
        </Text>

        {#if bookings !== undefined && bookings.length > 0}
          <table class="FancyTable">
            <thead>
              <tr>
                <th> Name </th>
                <th> Slot Date </th>
                <th> Timing </th>
                <th> Cost </th>
              </tr>
            </thead>
            <tbody>
              {#each bookings as item}
                <tr>
                  <td>
                    {item.instance.name}
                  </td>
                  <td>
                    {new Date(item.start).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    {new Date(item.start).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                    {' '}-{' '}
                    {new Date(item.end).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true
                    })}
                  </td>
                  <td> {item.cost} </td>
                </tr>
              {/each}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4"> </td>
              </tr>
            </tfoot>
          </table>
        {/if}

        {#if adminNotes !== ''}
          <Hr style="border-color: #dee2e6; margin: 20px 0;" />
          <Text style="color: #333; font-size: 16px; line-height: 24px;">
            Admin note: {adminNotes}
          </Text>
        {/if}

        <Hr style="border-color: #dee2e6; margin: 20px 0;" />

        <Text style="color: #333; font-size: 16px; line-height: 24px;">
          We're really looking forward to seeing you! Your presence will make our day brighter. ✨
        </Text>
      {/if}

      <Text style="color: #6c757d; font-size: 14px; text-align: center;">See you soon!</Text>
      <Text style="color: #6c757d; font-size: 14px; text-align: center;">
        Best wishes,
        <br />
        The Makerspace
      </Text>
    </Container>
  </Body>
</Html>
