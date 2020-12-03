These apply to both user experience and developer experience! See also [the Vitess guiding principles](../../GUIDING_PRINCIPLES.md).


Sustainable
- use industry-standard tools with good documentation
- bias to longevity and stability
- document rationale and trade offs around core technology choices
- be opinionated where it matters, and automate those opinions to minimize bikeshedding
- It should be hard to make a mistake: prioritize the parts of the testing + CI stack where we get maximum ROI


Consistent
- it’s worth investing in a cohesive design system
- making the consistent decision should be the easiest one
- Composable components that are rigorously documented: every component should have a name, a purpose, an intended use, and concrete examples
- Be flexible, provide options


Straightforward.
- Design with the 2am on-call engineer in mind.
- Be obvious and unambiguous.
- Aesthetics matter.


Welcoming/inclusive
- Don’t assume Vitess experience (UX) or front-end experience (DX)
- Optimizing velocity (UX/DX) is never a waste of time
- Don’t assume fast internet, powerful computers, big screens, lots of storage, etc. 
- Document our best practices
- Be conversational + unobtrusive


Tolerant
- errors should be hard to make
- handle errors respectfully
- express error messages in plain language (no codes), precisely indicate the problem, and offer a solution
- provide rollbacks/undo whenever possible
- consider emergency exits to leave unwanted states
- if there are error-prone conditions, provide adequate context (help/documentation) + confirmation options before committing to an action
