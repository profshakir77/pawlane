// Buying guides answer the questions people type into Google before they buy.
// Write them the way you'd explain it to a friend. Add one a week.
export type Block = { h2?: string; p?: string };
export type Guide = { slug: string; title: string; description: string; date: string; category: string; blocks: Block[] };

export const GUIDES: Guide[] = [
  {
    slug: "how-to-choose-a-calming-bed-for-an-anxious-dog",
    title: "Picking a calming bed for an anxious dog",
    description: "What these beds actually do, how to get the size right, and when a bed won't be enough.",
    date: "2026-10-16",
    category: "Beds",
    blocks: [
      { p: "A calming bed is just a round, deep bed with a raised edge. There's nothing clever inside it. What it does is give your dog somewhere to curl up with something pressed against their back, a bit like sleeping against a littermate. A lot of dogs who wander around at night will settle faster in one. Some won't care at all." },
      { h2: "Get the size right" },
      { p: "Most returns we see are beds that are too small. Wait until your dog is asleep and curled up, measure across them, and add about 15 cm. If your dog sleeps stretched out on their side, a round bed is the wrong shape entirely. Get something rectangular that's at least as long as they are from nose to the base of the tail." },
      { h2: "Make sure the cover comes off" },
      { p: "Fluffy beds hold on to hair, mud and smell. If the cover doesn't zip off and go in the machine, you'll be throwing the whole thing away in a few months." },
      { h2: "When it's more than a bed problem" },
      { p: "If your dog chews doors when you leave, howls for hours, or the nervousness started out of nowhere, have a word with your vet. A comfy bed helps a dog relax. It isn't a fix for separation anxiety." },
    ],
  },
  {
    slug: "do-cats-drink-more-from-a-water-fountain",
    title: "Do cats really drink more from a fountain?",
    description: "Why so many cats ignore their water bowl, how to get them using a fountain, and how to keep it clean.",
    date: "2026-10-16",
    category: "Feeding",
    blocks: [
      { p: "Often, yes. Plenty of cats walk straight past a full bowl and then try to drink from the kitchen tap. Running water stays cooler and tastes fresher, and the sound gets their attention. A fountain gives them that all day without you leaving the tap on." },
      { h2: "Don't swap it in overnight" },
      { p: "Put the fountain down next to the old bowl and leave both out for a week. Some cats are suspicious of the hum at first. Once you've seen yours drinking from the fountain a few times, take the bowl away." },
      { h2: "Where you put it matters" },
      { p: "Keep it away from the food bowl and well away from the litter tray. Cats don't like water near either. A quiet spot in a room they spend time in usually works." },
      { h2: "Keeping it clean" },
      { p: "Give it a rinse once a week and change the filter every two to four weeks. If it starts to smell or feel slimy, your cat will stop using it before you notice." },
    ],
  },
  {
    slug: "best-harness-for-a-dog-that-pulls",
    title: "What kind of harness helps a dog that pulls?",
    description: "Front clip, back clip, or both? A plain explanation, plus how to measure so it actually fits.",
    date: "2026-10-16",
    category: "Walking",
    blocks: [
      { p: "Short answer: one where the lead clips on at the chest. With a back clip, your dog leans into the harness and pulls you along like a sled. With a front clip, every pull turns them slightly sideways, so pulling stops getting them anywhere." },
      { h2: "It helps, it doesn't train" },
      { p: "Most people feel a difference on the first walk. But a harness only makes pulling less rewarding. If you want a dog that walks nicely on a loose lead, you still need to practise: stop when they pull, move again when the lead goes slack. Boring, but it works." },
      { h2: "Measuring" },
      { p: "Wrap a soft tape around the widest part of the chest, just behind the front legs. Go by that number, not your dog's weight. If they fall between two sizes, pick the bigger one and tighten the straps." },
      { h2: "Checking the fit" },
      { p: "You should be able to slide two fingers under any strap. If it rubs under the front legs after a walk, loosen the chest strap a little. If your dog can back out of it, it's too loose." },
    ],
  },
  {
    slug: "do-lick-mats-help-dogs",
    title: "Are lick mats worth it?",
    description: "What lick mats are good for, what to put on them, and how to stop your dog chewing the mat itself.",
    date: "2026-10-16",
    category: "Feeding",
    blocks: [
      { p: "For the price, they're one of the more useful things you can buy. Licking is calming for most dogs, and a mat with a thin layer of something tasty can keep them busy for ten minutes or more. People use them during baths, nail trims, vet visits at home, or just to stop a dog begging at dinner." },
      { h2: "What to spread on it" },
      { p: "Plain peanut butter (check the label for xylitol, which is toxic to dogs), natural yoghurt, mashed banana, or their usual wet food. Spread it thin and push it into the grooves. Freeze it for an hour and it lasts much longer." },
      { h2: "If your dog chews it" },
      { p: "Some dogs try to eat the mat once the food is gone. Stay nearby the first few times and pick it up as soon as they've finished licking. It's a supervised toy, not something to leave in the crate." },
    ],
  },
];
