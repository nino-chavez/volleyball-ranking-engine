// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RankMovement from '../RankMovement.svelte';

afterEach(cleanup);

describe('RankMovement', () => {
	it('shows NEW badge when previousRank is null', () => {
		render(RankMovement, { props: { currentRank: 5, previousRank: null } });
		expect(screen.getByText('NEW')).toBeTruthy();
		expect(screen.getByLabelText('New entry')).toBeTruthy();
	});

	it('shows green up arrow when rank improved', () => {
		render(RankMovement, { props: { currentRank: 3, previousRank: 7 } });
		// Movement = 7 - 3 = 4 (up 4 positions)
		expect(screen.getByText('4')).toBeTruthy();
		expect(screen.getByLabelText('Up 4 positions')).toBeTruthy();
	});

	it('shows singular label for 1 position change', () => {
		render(RankMovement, { props: { currentRank: 2, previousRank: 3 } });
		expect(screen.getByText('1')).toBeTruthy();
		expect(screen.getByLabelText('Up 1 position')).toBeTruthy();
	});

	it('shows red down arrow when rank dropped', () => {
		render(RankMovement, { props: { currentRank: 8, previousRank: 3 } });
		// Movement = 3 - 8 = -5 (down 5 positions)
		expect(screen.getByText('5')).toBeTruthy();
		expect(screen.getByLabelText('Down 5 positions')).toBeTruthy();
	});

	it('shows gray dash when rank unchanged', () => {
		render(RankMovement, { props: { currentRank: 5, previousRank: 5 } });
		expect(screen.getByLabelText('No change')).toBeTruthy();
	});
});
