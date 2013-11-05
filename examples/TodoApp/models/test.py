def g(st):
   result = 0
   x = 48
   for i, n in enumerate(reversed(st)):
      result += ( (ord(n) - x) * (10 ** i ))

   return result
