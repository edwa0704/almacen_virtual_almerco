# Warehouse Layout Visualization

## BEFORE (Problematic - with overlaps):
```
   0 1 2 3 4 5 6 7 8 91011121314151617181 9
 0  . . . . . . . . . . . . . . . . . . . .
 1  . . . . . . . . . . . . . . . . . . . .
 2  . . . . . . . . . . . . . . . . . . . .
 3  . . . . . . . . . . . . . . . . . . . .
 4  . . . . . . . . . . . . . . . . . . . .
 5  . . . . S2S4S4S4S4S4S4S1  . . S5 S5 . .  <- OVERLAPS HERE!
 6  . . . . S2  . . . . . S1  . . . . . . .
 7  . . . . S2  . . . . . S1  . . S5 S5 . .
 8  . . . . S2  . . . . . S1  . . . . . . .
 9  . . . . S4S4S4S4S4S4  . . . . . . .  <- OVERLAPS HERE!
10  . . . . S2  . . . . . S1  . . . . . . .
11  . . . . S2  . . . . . S1  . . . . . . .
12  . . . . S2  . . . . . S1  . . . . . . .
13  . . . . S2  . . . . . S1  . . . . . . .
14  . . . . S2  . . . . . S1  . . . . . . .
15  . . . . . . . . . . . . . . . . . . . .
16  . . . . . . .ENT . . . . . . . . . . . .
17  . . . . . . . . . . . . . . . . . . . .
18  . . . . . . . . . . . . . . . . . . . .
19  . . . . . . . . . . . . . . . . . . . .
```

## AFTER (Fixed - Clean L-shape without gaps):
```
   0 1 2 3 4 5 6 7 8 91011121314151617181 9
 0  . . . . . . . . . . . . . . . . . . . .
 1  . . . . . . . . . . S3 S3  . . . . . . .
 2  . . . . . . . . . . S3 S3  . . . . . . .
 3  . . . . . . . . . . S3 S3 S5 S5  . . . .
 4  . . . . . . . . . . S3 S3 S5 S5  . . . .
 5  . . . S4S4S4S4S4S4  . . S5 S5  . . . .  <- Clean corner!
 6  . . . S2  . . . . . S1 S1  . . . . . . .
 7  . . . S2  . . . . . S1 S1  . . . . . . .
 8  . . . S2  . . . . . S1 S1  . . . . . . .
 9  . . . S2  . . . . . S1 S1  . . . . . . .
10  . . . S2  . . . . . S1 S1  . . . . . . .
11  . . . S2  . . . . . S1 S1  . . . . . . .
12  . . . S2  . . . . . . . . . . . . . . .
13  . . . S2  . . . . . . . . . . . . . . .
14  . . . S2  . . . . . . . . . . . . . . .
15  . . . S2  . . . . . . . . . . . . . . .
16  . . . . . .ENT . . . . . . . . . . . .
17  . . . . . . . . . . . . . . . . . . . .
18  . . . . . . . . . . . . . . . . . . . .
19  . . . . . . . . . . . . . . . . . . . .

Legend:
E = Entrance
S1 = Shelf 1 (right side of first corridor)
S2 = Shelf 2 (left side of first corridor)
S4 = Shelf 4 (horizontal corner, connecting to S2)
S3 = Shelf 3 (right side of second corridor)
S5 = Shelf 5 (end blocker)
```

## Key Improvements:

### ✅ FIXED: No overlapping shelves
- Shelf 1 and Shelf 2 ocupy separate x-ranges (4 vs 10-11)
- Shelf 4 is purely horizontal at the corner (y=5)
- Shelf 3 and Shelf 5 are in the second corridor with no conflicts

### ✅ FIXED: Clean L-shaped corner
- Shelf 2 goes from (4,6) to (4,15)
- Shelf 4 at (4,5) connects directly to Shelf 2 at the corner
- Forms a perfect L-shape with no gaps

### ✅ FIXED: Proper navigation path
1. **Entrance**: (7, 16)
2. **First corridor** (vertical): Walk from (7,16) upward to (7,6)
   - Shelf 1 blocks on the right (x=10-11)
   - Shelf 2 blocks on the left (x=4)
3. **Turn**: At y=5, turn right
   - Shelf 4 (horizontal) guides the turn
4. **Second corridor** (horizontal): Walk right from (10,5) toward (13,5)
   - Shelf 3 is on the right (x=11-12)
   - Shelf 5 blocks further progress at x=13-14
